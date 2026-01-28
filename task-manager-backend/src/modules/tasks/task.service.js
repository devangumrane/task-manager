import prisma from "../../core/database/prisma.js";
import ApiError from "../../core/errors/ApiError.js";

import { assertWorkspaceMember } from "../../core/authorization/workspace.guard.js";
import { assertTaskWorkspaceAccess } from "../../core/authorization/task.guard.js";

import { createTaskCore } from "./task.logic.js";
import { buildTaskUpdatePayload } from "./task.update.logic.js";

import { onTaskCreated } from "./task.effects.js";
import { onTaskUpdated } from "./task.update.effects.js";

export const taskService = {
  // --------------------------------------------------------
  // CREATE TASK
  // --------------------------------------------------------
  async createTask(projectId, creatorId, data) {
    return prisma.$transaction(async (tx) => {
      // 1️⃣ Resolve project
      const project = await tx.project.findUnique({
        where: { id: projectId },
        select: { id: true, workspaceId: true },
      });

      if (!project) {
        throw new ApiError("PROJECT_NOT_FOUND", "Project not found", 404);
      }

      // 2️⃣ Authorization
      await assertWorkspaceMember(tx, creatorId, project.workspaceId);

      // 3️⃣ Assigned user invariant (CREATE)
      if (data.assignedTo) {
        const member = await tx.workspaceMember.findFirst({
          where: {
            userId: data.assignedTo,
            workspaceId: project.workspaceId,
          },
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
        task = await createTaskCore(tx, {
          ...data,
          projectId,
          createdBy: creatorId,
          status: "todo",
        });
      } catch (err) {
        if (err?.code === "P2002") {
          throw new ApiError("CONFLICT", "Task conflict (duplicate)", 409, {
            meta: err.meta,
          });
        }
        throw err;
      }

      // 5️⃣ Side effects (BEST-EFFORT)
      try {
        await onTaskCreated(project, task, creatorId);
      } catch (err) {
        console.error("onTaskCreated failed:", err);
      }

      return task;
    });
  },

  // --------------------------------------------------------
  // LIST TASKS
  // --------------------------------------------------------
  async listTasks(projectId, userId) {
    // 1️⃣ Resolve project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, workspaceId: true },
    });

    if (!project) {
      throw new ApiError("PROJECT_NOT_FOUND", "Project not found", 404);
    }

    // 2️⃣ Authorization
    await assertWorkspaceMember(prisma, userId, project.workspaceId);

    // 3️⃣ Read
    return prisma.task.findMany({
      where: { projectId },
      include: {
        assigned: true,
        creator: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // --------------------------------------------------------
  // GET SINGLE TASK
  // --------------------------------------------------------
  async getTask(taskId, userId) {
    // Authorization + existence
    await assertTaskWorkspaceAccess(prisma, userId, taskId);

    return prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assigned: true,
        creator: true,
        labels: true,
        subtasks: {
          include: { assigned: true },
          orderBy: { order: "asc" }
        },
        comments: {
          include: { user: true },
          orderBy: { createdAt: "asc" }
        },
        project: {
          select: { id: true, workspaceId: true },
        },
      },
    });
  },

  // --------------------------------------------------------
  // UPDATE TASK
  // --------------------------------------------------------
  async updateTask(taskId, data, updatedBy) {
    return prisma.$transaction(async (tx) => {
      // 1️⃣ Authorization + fetch
      const task = await assertTaskWorkspaceAccess(tx, updatedBy, taskId);

      // 2️⃣ Build safe update payload
      const updatePayload = buildTaskUpdatePayload(data);

      // 3️⃣ Assigned user invariant (UPDATE)
      if (updatePayload.assignedTo) {
        const member = await tx.workspaceMember.findFirst({
          where: {
            userId: updatePayload.assignedTo,
            workspaceId: task.project.workspaceId,
          },
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
      const updated = await tx.task.update({
        where: { id: taskId },
        data: updatePayload,
      });

      // 5️⃣ Side effects (BEST-EFFORT)
      try {
        await onTaskUpdated(
          updated,
          updatePayload,
          updatedBy,
          task.project.workspaceId
        );
      } catch (err) {
        console.error("onTaskUpdated failed:", err);
      }

      return updated;
    });
  },

  // --------------------------------------------------------
  // DELETE TASK
  // --------------------------------------------------------
  async deleteTask(taskId, userId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { id: true, workspaceId: true } },
      },
    });

    if (!task) {
      throw new ApiError("TASK_NOT_FOUND", "Task not found", 404);
    }

    await assertWorkspaceMember(prisma, userId, task.project.workspaceId);

    await prisma.task.delete({ where: { id: taskId } });

    return true;
  },
};
