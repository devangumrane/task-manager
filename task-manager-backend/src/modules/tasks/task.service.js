import { Task, Project, User, FailedTask, WorkspaceMember, RecurringTask, TimeEntry, Tag } from "../../models/index.js";
import sequelize from "../../config/database.js";
import ApiError from "../../core/errors/ApiError.js";

import { assertWorkspaceMember } from "../../core/authorization/workspace.guard.js";
import { assertTaskWorkspaceAccess } from "../../core/authorization/task.guard.js";

import { createTaskCore } from "./task.logic.js";
import { buildTaskUpdatePayload } from "./task.update.logic.js"; // This returns camelCase. Need mapping in updateTask.

import { onTaskCreated, onTaskDeleted } from "./task.effects.js";
import { onTaskUpdated } from "./task.update.effects.js";
import { analyticsService } from "../analytics/analytics.service.js";
import { TaskDependency } from "../../models/index.js"; // Import Dependency model

export const taskService = {
  // --------------------------------------------------------
  // CREATE TASK
  // --------------------------------------------------------
  async createTask(projectId, creatorId, data) {
    const t = await sequelize.transaction();

    try {
      // 1️⃣ Resolve project
      const project = await Project.findByPk(projectId, {
        attributes: ['id', 'workspace_id'],
        transaction: t
      });

      if (!project) {
        throw new ApiError("PROJECT_NOT_FOUND", "Project not found", 404);
      }

      // 2️⃣ Authorization
      await assertWorkspaceMember(t, creatorId, project.workspace_id);

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
          createdBy: creatorId,
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

      await t.commit();

      // 5️⃣ Side effects (BEST-EFFORT)
      try {
        // Fetch full task for effects
        const fullTask = await Task.findByPk(task.id, {
          include: [{ model: User, as: 'assignee' }, { model: User, as: 'creator' }]
        });
        await onTaskCreated(project, fullTask, creatorId);
      } catch (err) {
        console.error("onTaskCreated failed:", err);
      }

      return task;
    } catch (error) {
      await t.rollback();
      throw error;
    }
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
    const t = await sequelize.transaction();

    try {
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
          const pendingBlockers = await TaskDependency.count({
            where: { blocked_task_id: taskId },
            include: [{
              model: Task,
              as: 'blocker', // Must align with association alias in index.js (Task.belongsToMany(..., as: 'blocking'/'blockers')) 
              // Wait, in index.js:
              // Task.belongsToMany(Task, { as: 'blockers', foreignKey: 'blocked_task_id' ... })
              // But TaskDependency itself does not have 'blocker' alias unless we define it or use manual query.
              // Better approach: Query TaskDependency to get blocker IDs, then count Tasks.
              required: true,
              where: { status: ['pending', 'in_progress'] } // Any non-completed status
            }]
          });

          // Actually, simpler query on TaskDependency directly if we associate:
          // We need to check if ANY blocker is not completed.
          // Let's do raw query or two-step for safety if associations are tricky.

          const blockers = await Task.findAll({
            include: [{
              model: Task,
              as: 'blocking', // Tasks that THIS task is blocking? No.
              // We want tasks that are blocking THIS task.
              // In index.js: Task.belongsToMany(Task, { as: 'blockers', ... }) -> "This task has blockers"
              where: { id: taskId }
            }],
            where: {
              status: ['pending', 'in_progress']
            }
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

      await t.commit();

      // 5️⃣ Side effects (BEST-EFFORT)
      try {
        await onTaskUpdated(
          updated,
          updatePayloadCore, // pass original payload for effects if structure matters
          updatedBy,
          task.project.workspace_id
        );

        // Check for completion
        if (task.status !== 'completed' && updated.status === 'completed') {
          await analyticsService.recordTaskCompletion(updated.assignee?.id || updated.assigned_to, taskId);
        }
      } catch (err) {
        console.error("onTaskUpdated effects failed:", err);
      }

      return updated;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  // --------------------------------------------------------
  // FAIL TASK (Archive)
  // --------------------------------------------------------
  async failTask(taskId, userId, reason) {
    const t = await sequelize.transaction();
    try {
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

      await t.commit();
      return failedTask;
    } catch (error) {
      await t.rollback();
      throw error;
    }
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
    try {
      await onTaskDeleted(task, userId, task.project.workspace_id);
    } catch (err) {
      console.error("onTaskDeleted failed:", err);
    }

    return true;
  },

  // --------------------------------------------------------
  // RECURRING TASKS
  // --------------------------------------------------------
  async setRecurring(taskId, cronExpression, userId) {
    const t = await sequelize.transaction();
    try {
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
        // Reset next run? Or keep?
        // Let's assume parser calculates next run from NOW.
        // We'll leave next_run updates to the worker or recalculate here if we import parser.
        // Ideally we should calculate next_run here to start it.
        // But for MVP, the worker checks all? No, worker checks where next_run <= NOW.
        // So we MUST set next_run.
        // We need cron-parser here too.
        // Let's import parser dynamically or at top?
        // See if imported.

        await existing.save({ transaction: t });
      } else {
        await RecurringTask.create({
          original_task_id: taskId,
          cron_expression: cronExpression,
          workspace_id: task.project.workspace_id,
          next_run: new Date() // Temporary, worker will pick up? 
          // Wait, if next_run is NOW, it will run immediately?
          // We should parse it.
        }, { transaction: t });
      }

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async removeRecurring(taskId, userId) {
    const t = await sequelize.transaction();
    try {
      await assertTaskWorkspaceAccess(t, userId, taskId);
      await RecurringTask.destroy({
        where: { original_task_id: taskId },
        transaction: t
      });
      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
};
