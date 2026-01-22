import prisma from "../../core/database/prisma.js";
import { activityService } from "../activity/activity.service.js";
import { getEmitters } from "../../core/realtime/socket.js";
import ApiError from "../../core/errors/ApiError.js";

export const reminderService = {
  async createReminder({ workspaceId, projectId, taskId, reminderTime, note, createdBy }) {
    if (!taskId) throw new ApiError("INVALID_INPUT", "taskId is required", 400);
    if (!reminderTime) throw new ApiError("INVALID_INPUT", "reminderTime is required", 400);

    const normalizedTime =
      reminderTime instanceof Date ? reminderTime : new Date(reminderTime);

    if (Number.isNaN(normalizedTime.getTime())) {
      throw new ApiError("INVALID_INPUT", "Invalid reminderTime", 400);
    }

    // ensure task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, projectId: true },
    });

    if (!task) {
      throw new ApiError("TASK_NOT_FOUND", "Task not found", 404);
    }

    const reminder = await prisma.taskReminder.create({
      data: {
        taskId,
        reminderTime: normalizedTime,
        status: "scheduled",
      },
    });

    // -------------------------
    // ACTIVITY LOG (normalized)
    // -------------------------
    try {
      await activityService.log({
        workspaceId,
        userId: createdBy,
        taskId,
        projectId,
        type: "reminder.created",
        metadata: {
          id: reminder.id,
          reminderTime: normalizedTime.toISOString(),
          note,
          actorId: createdBy,
        },
      });
    } catch (err) {
      console.error("activityService.log (reminder.created) failed:", err);
    }

    // -------------------------
    // SOCKET EMIT (normalized)
    // -------------------------
    try {
      const emitters = getEmitters();
      emitters?.emitToWorkspace(workspaceId, "reminder.created", {
        reminder: {
          id: reminder.id,
          taskId,
          reminderTime: normalizedTime.toISOString(),
          note,
        },
        meta: { byUserId: createdBy },
      });
    } catch (err) {
      console.error("emitters.emitToWorkspace (reminder.created) failed:", err);
    }

    return reminder;
  },

  async listReminders(taskId) {
    if (!taskId) throw new ApiError("INVALID_INPUT", "taskId is required", 400);

    return prisma.taskReminder.findMany({
      where: { taskId },
      orderBy: { reminderTime: "asc" },
    });
  },

  async deleteReminder(reminderId, userId = null) {
    try {
      const r = await prisma.taskReminder.delete({
        where: { id: reminderId },
      });

      const task = await prisma.task.findUnique({
        where: { id: r.taskId },
        include: { project: true },
      });

      if (task) {
        // -------------------------
        // ACTIVITY LOG
        // -------------------------
        try {
          await activityService.log({
            workspaceId: task.project.workspaceId,
            userId,
            taskId: r.taskId,
            projectId: task.projectId,
            type: "reminder.deleted",
            metadata: {
              id: r.id,
              actorId: userId,
            },
          });
        } catch (err) {
          console.error("activityService.log (reminder.deleted) failed:", err);
        }

        // -------------------------
        // SOCKET EMIT
        // -------------------------
        try {
          const emitters = getEmitters();
          emitters?.emitToWorkspace(task.project.workspaceId, "reminder.deleted", {
            reminder: { id: r.id, taskId: r.taskId },
            meta: { byUserId: userId },
          });
        } catch (err) {
          console.error("emitters.emitToWorkspace (reminder.deleted) failed:", err);
        }
      }

      return r;
    } catch (err) {
      if (err?.code === "P2025") {
        throw new ApiError("NOT_FOUND", "Reminder not found", 404);
      }
      throw err;
    }
  },
};
