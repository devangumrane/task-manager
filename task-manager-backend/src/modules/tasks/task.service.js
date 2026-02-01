import prisma from "../../core/database/prisma.js";
import ApiError from "../../core/errors/ApiError.js";


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
      // 1️⃣ Resolve project & Authorization (Member check)
      const member = await tx.projectMember.findUnique({
        where: { userId_projectId: { userId: creatorId, projectId } },
      });

      if (!member) {
        throw new ApiError("FORBIDDEN", "You are not a member of this project", 403);
      }

      // 2️⃣ Create task
      const task = await createTaskCore(tx, {
        ...data,
        projectId,
        assigneeId: data.assignedTo || null, // Map assignedTo to assigneeId
        // createdBy: creatorId, // Note: Task schema doesn't have createdBy column in new schema? Checking schema...
        // Wait, professional schema has `assigneeId` but not `createdBy` explicitly? 
        // Let's check schema: Task { id, projectId, assigneeId, ... }
        // Ah, schema doesn't have createdBy. It has activities.
      });

      // 3️⃣ Side effects (Activity Log)
      await tx.activityLog.create({
        data: {
          projectId,
          userId: creatorId,
          action: "task.created",
          metadata: { taskId: task.id, title: task.title },
        },
      });

      return task;
    });
  },

  // --------------------------------------------------------
  // LIST TASKS
  // --------------------------------------------------------
  async listTasks(projectId, userId) {
    // 1️⃣ Authorization
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (!member) throw new ApiError("FORBIDDEN", "Access denied", 403);

    // 2️⃣ Read
    return prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: true,
        comments: { include: { user: true } },
      },
      orderBy: { position: "asc" },
    });
  },

  // --------------------------------------------------------
  // GET SINGLE TASK
  // --------------------------------------------------------
  async getTask(taskId, userId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        assignee: true,
        comments: { include: { user: true } },
      },
    });

    if (!task) throw new ApiError("TASK_NOT_FOUND", "Task not found", 404);

    // Authorization
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: task.projectId } },
    });
    if (!member) throw new ApiError("FORBIDDEN", "Access denied", 403);

    return task;
  },

  // --------------------------------------------------------
  // UPDATE TASK
  // --------------------------------------------------------
  async updateTask(taskId, data, updatedBy) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new ApiError("TASK_NOT_FOUND", "Task not found", 404);

    // Authorization
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: updatedBy, projectId: task.projectId } },
    });
    if (!member) throw new ApiError("FORBIDDEN", "Access denied", 403);

    // Update
    return prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status, // Ensure enum match
        assigneeId: data.assignedTo, // Remap
        dueDate: data.dueDate,
        position: data.position,
      },
    });
  },

  // --------------------------------------------------------
  // DELETE TASK
  // --------------------------------------------------------
  async deleteTask(taskId, userId) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new ApiError("TASK_NOT_FOUND", "Task not found", 404);

    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: task.projectId } },
    });
    // Maybe only ADMIN/OWNER can delete? Or anyone? Let's say anyone for now matching "Professional" basic reqs
    if (!member) throw new ApiError("FORBIDDEN", "Access denied", 403);

    await prisma.task.delete({ where: { id: taskId } });
    return true;
  },
};
