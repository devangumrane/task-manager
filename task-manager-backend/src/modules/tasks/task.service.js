import { Task, Project, User, FailedTask, WorkspaceMember, RecurringTask, TimeEntry, Tag, Workspace } from "../../models/index.js";
import sequelize from "../../config/database.js";
import ApiError from "../../core/errors/ApiError.js";

import { assertWorkspaceMember } from "../../core/authorization/workspace.guard.js";
import { assertTaskWorkspaceAccess } from "../../core/authorization/task.guard.js";

import { createTaskCore } from "./task.logic.js";
import { buildTaskUpdatePayload } from "./task.update.logic.js";

import { eventBus, EVENTS } from "../../core/events/eventBus.js";
import { analyticsService } from "../analytics/analytics.service.js";
import { TaskDependency } from "../../models/index.js";

export const taskService = {
  // --------------------------------------------------------
  // CREATE TASK
  // --------------------------------------------------------
  async createTask(projectId, userId, data) {
    const { task, project } = await sequelize.transaction(async (t) => {
      // 1️⃣ Resolve project
      const project = await Project.findByPk(projectId, { transaction: t });

      if (!project) {
        throw new ApiError("PROJECT_NOT_FOUND", "Project not found", 404);
      }

      // 2️⃣ Authorization
      await assertWorkspaceMember(t, userId, project.workspace_id);

      // 3️⃣ Assigned user invariant (CREATE)
      if (data.assignedTo) {
        const member = await WorkspaceMember.findOne({
          where: {
            user_id: data.assignedTo,
            workspace_id: project.workspace_id,
          },
          transaction: t
        });

        if (!member) {
          throw new ApiError(
            "INVALID_ASSIGNEE",
            "Assigned user is not part of workspace",
            400
          );
        }
      }

      // 4️⃣ Create task
      let task;
      try {
        task = await createTaskCore(t, {
          ...data,
          projectId,
          createdBy: userId,
          workspaceId: project.workspace_id, // Pass workspaceId
          status: "pending", // Default
        });
      } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
          throw new ApiError("CONFLICT", "Task conflict (duplicate)", 409, {
            meta: err.fields,
          });
        }
        throw err;
      }

      return { task, project };
    });

    // 5️⃣ Side effects (BEST-EFFORT)
    try {
      // Fetch full task for effects
      const fullTask = await Task.findByPk(task.id, {
        include: [{ model: User, as: 'assignee' }, { model: User, as: 'creator' }]
      });
      eventBus.emit(EVENTS.TASK.CREATED, { project, task: fullTask, userId });
    } catch (err) {
      console.error("Event emit (TASK.CREATED) failed:", err);
    }

    return task;
  },

  // --------------------------------------------------------
  // LIST TASKS
  // --------------------------------------------------------
  async listTasks(projectId, userId) {
    // 1️⃣ Resolve project
    const project = await Project.findByPk(projectId, {
      attributes: ['id', 'workspace_id'],
    });

    if (!project) {
      throw new ApiError("PROJECT_NOT_FOUND", "Project not found", 404);
    }

    // 2️⃣ Authorization
    await assertWorkspaceMember(null, userId, project.workspace_id);

    // 3️⃣ Read
    return Task.findAll({
      where: { project_id: projectId },
      include: [
        { model: User, as: 'assignee' },
        { model: User, as: 'creator' },
        { model: Tag, as: 'tags', through: { attributes: [] } },
        { model: RecurringTask, as: 'recurring' },
        {
          model: Task,
          as: 'blockers',
          through: { attributes: [] },
          attributes: ['id', 'title', 'status']
        },
      ],
      order: [["order", "ASC"], ["createdAt", "DESC"]],
    });
  },

  // --------------------------------------------------------
  // GET SINGLE TASK
  // --------------------------------------------------------
  async getTask(taskId, userId) {
    // Authorization + existence
    // This helper returns the task with project included.
    const taskAuth = await assertTaskWorkspaceAccess(null, userId, taskId);

    // We fetch again or use the returned one. 
    // Usually we want full details.

    return Task.findByPk(taskId, {
      include: [
        { model: User, as: 'assignee' },
        { model: User, as: 'creator' },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'workspace_id', 'name']
        },
        // Enterprise Features
        { model: Tag, as: 'tags', through: { attributes: [] } },
        { model: TimeEntry, as: 'timeEntries' },
        { model: RecurringTask, as: 'recurring' },
        {
          model: Task,
          as: 'blockers',
          through: { attributes: [] },
          attributes: ['id', 'title', 'status']
        },
        {
          model: Task,
          as: 'blocking',
          through: { attributes: [] },
          attributes: ['id', 'title', 'status']
        },
      ],
    });
  },

  // --------------------------------------------------------
  // UPDATE TASK
  // --------------------------------------------------------
  async updateTask(taskId, data, updatedBy) {
    const { updated, originalTask, updatePayloadCore } = await sequelize.transaction(async (t) => {
      // 1️⃣ Authorization + fetch
      const task = await assertTaskWorkspaceAccess(t, updatedBy, taskId);
      // assertTaskWorkspaceAccess returns task with project

      // 2️⃣ Build safe update payload
      const updatePayloadCore = buildTaskUpdatePayload(data);

      // Map to Sequelize fields
      const updatePayload = {};
      if (updatePayloadCore.title) updatePayload.title = updatePayloadCore.title;
      if (updatePayloadCore.description !== undefined) updatePayload.description = updatePayloadCore.description;
      if (updatePayloadCore.priority) updatePayload.priority = updatePayloadCore.priority.toLowerCase();
      if (updatePayloadCore.status) {
        const newStatus = updatePayloadCore.status === 'todo' ? 'pending' : updatePayloadCore.status;

        // 🚨 BLOCKER CHECK
        if (newStatus === 'completed' && task.status !== 'completed') {
          const blockers = await Task.findAll({
            include: [{
              model: Task,
              as: 'blocking',
              where: { id: taskId }
            }],
            where: {
              status: ['pending', 'in_progress']
            },
            transaction: t
          });

          if (blockers.length > 0) {
            throw new ApiError("TASK_BLOCKED", `Cannot complete task. It is blocked by ${blockers.length} incomplete task(s).`, 400);
          }
        }

        updatePayload.status = newStatus;
      }
      if (updatePayloadCore.dueDate !== undefined) updatePayload.deadline = updatePayloadCore.dueDate;
      if (updatePayloadCore.assignedTo !== undefined) updatePayload.assigned_to = updatePayloadCore.assignedTo;
      if (updatePayloadCore.order !== undefined) updatePayload.order = updatePayloadCore.order;

      // 3️⃣ Assigned user invariant (UPDATE)
      if (updatePayload.assigned_to) {
        const member = await WorkspaceMember.findOne({
          where: {
            user_id: updatePayload.assigned_to,
            workspace_id: task.project.workspace_id,
          },
          transaction: t
        });

        if (!member) {
          throw new ApiError(
            "INVALID_ASSIGNEE",
            "Assigned user is not part of workspace",
            400
          );
        }
      }

      // 4️⃣ Update
      await Task.update(updatePayload, {
        where: { id: taskId },
        transaction: t
      });

      if (data.skills && Array.isArray(data.skills)) {
        // Use the fetched task instance to set association
        await task.setSkills(data.skills, { transaction: t });
      }

      const updated = await Task.findByPk(taskId, { transaction: t });

      return { updated, originalTask: task, updatePayloadCore };
    });

    // 5️⃣ Side effects (BEST-EFFORT)
    try {
      eventBus.emit(EVENTS.TASK.UPDATED, {
        task: updated,
        changes: updatePayloadCore,
        userId: updatedBy,
        workspaceId: originalTask.project.workspace_id
      });

      // Check for completion
      if (originalTask.status !== 'completed' && updated.status === 'completed') {
        await analyticsService.recordTaskCompletion(updated.assignee?.id || updated.assigned_to, taskId);
      }
    } catch (err) {
      console.error("Event emit (TASK.UPDATED) failed:", err);
    }

    return updated;
  },

  // --------------------------------------------------------
  // FAIL TASK (Archive)
  // --------------------------------------------------------
  async failTask(taskId, userId, reason) {
    return sequelize.transaction(async (t) => {
      // 1️⃣ Get task with data to snapshot
      const task = await Task.findByPk(taskId, {
        include: {
          model: Project,
          as: 'project',
          attributes: ['id', 'workspace_id'],
        },
        transaction: t
      });

      if (!task) {
        throw new ApiError("TASK_NOT_FOUND", "Task not found", 404);
      }

      // 2️⃣ Authorization
      await assertWorkspaceMember(t, userId, task.project.workspace_id);

      // 3️⃣ Archive to FailedTask
      const failedTask = await FailedTask.create({
        original_task_id: task.id,
        reason,
        user_id: userId,
        data: task.toJSON(), // Snapshot full task object
      }, { transaction: t });

      // 4️⃣ Delete original task
      await Task.destroy({ where: { id: taskId }, transaction: t });

      return failedTask;
    });
  },

  async deleteTask(taskId, userId) {
    const task = await Task.findByPk(taskId, {
      include: {
        model: Project,
        as: 'project',
        attributes: ['id', 'workspace_id'],
      },
    });

    if (!task) {
      throw new ApiError("TASK_NOT_FOUND", "Task not found", 404);
    }

    await assertWorkspaceMember(null, userId, task.project.workspace_id);

    await Task.destroy({ where: { id: taskId } });

    // Side effect: emit deleted event
    // Side effect: emit deleted event
    try {
      eventBus.emit(EVENTS.TASK.DELETED, { task, userId, workspaceId: task.project.workspace_id });
    } catch (err) {
      console.error("Event emit (TASK.DELETED) failed:", err);
    }

    return true;
  },

  // --------------------------------------------------------
  // RECURRING TASKS
  // --------------------------------------------------------
  async setRecurring(taskId, cronExpression, userId) {
    return sequelize.transaction(async (t) => {
      // 1. Auth & Existence
      const task = await assertTaskWorkspaceAccess(t, userId, taskId);

      // 2. Upsert Recurring Rule
      // Check if exists
      const existing = await RecurringTask.findOne({
        where: { original_task_id: taskId },
        transaction: t
      });

      if (existing) {
        existing.cron_expression = cronExpression;
        await existing.save({ transaction: t });
      } else {
        await RecurringTask.create({
          original_task_id: taskId,
          cron_expression: cronExpression,
          workspace_id: task.project.workspace_id,
          next_run: new Date()
        }, { transaction: t });
      }
    });
  },

  async removeRecurring(taskId, userId) {
    return sequelize.transaction(async (t) => {
      await assertTaskWorkspaceAccess(t, userId, taskId);
      await RecurringTask.destroy({
        where: { original_task_id: taskId },
        transaction: t
      });
    });
  },

  // --------------------------------------------------------
  // GLOBAL: GET TASKS BY USER
  // --------------------------------------------------------
  async getTasksByUser(userId) {
    return Task.findAll({
      where: {
        assigned_to: userId,
        status: ['pending', 'in_progress'] // Show active tasks by default. Use status filter if needed later.
      },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'workspace_id'],
          include: { // Include workspace for context
            model: Workspace,
            as: 'workspace',
            attributes: ['id', 'name']
          }
        },
        { model: User, as: 'creator', attributes: ['id', 'username', 'email'] },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ],
      order: [
        ['priority', 'DESC'], // High priority first? Enums are string though... 'high', 'medium', 'low'. 
        // string sort: high > low > medium. Not ideal.
        // Let's sort by createdAt for now or deadline.
        ['deadline', 'ASC'], // Soonest due first
        ['createdAt', 'DESC']
      ]
    });
  }
};
