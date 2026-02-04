import { TaskReminder, Task, Project } from "../../models/index.js";
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
    const task = await Task.findByPk(taskId, {
      attributes: ['id', 'project_id'],
    });

    if (!task) {
      throw new ApiError("TASK_NOT_FOUND", "Task not found", 404);
    }

    const reminder = await TaskReminder.create({
      task_id: taskId,
      reminderTime: normalizedTime, // Mapped in model definition? task_reminders table uses reminder_time.
      // Wait, in Step 580 I defined model:
      // reminderTime: { type: DataTypes.DATE, field: 'reminder_time' }
      // So use key `reminderTime`.
      status: "scheduled",
      note,
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

    return TaskReminder.findAll({
      where: { task_id: taskId },
      order: [["reminderTime", "ASC"]],
    });
  },

  async deleteReminder(reminderId, userId = null) {
    const r = await TaskReminder.findByPk(reminderId);

    if (!r) {
      throw new ApiError("NOT_FOUND", "Reminder not found", 404);
    }

    await TaskReminder.destroy({ where: { id: reminderId } });

    const task = await Task.findByPk(r.task_id, {
      include: {
        model: Project,
        as: 'project',
        attributes: ['id', 'workspace_id']
      },
    });

    if (task) {
      // -------------------------
      // ACTIVITY LOG
      // -------------------------
      try {
        await activityService.log({
          workspaceId: task.project.workspace_id,
          userId,
          taskId: r.task_id,
          projectId: task.project_id,
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
        emitters?.emitToWorkspace(task.project.workspace_id, "reminder.deleted", {
          reminder: { id: r.id, taskId: r.task_id },
          meta: { byUserId: userId },
        });
      } catch (err) {
        console.error("emitters.emitToWorkspace (reminder.deleted) failed:", err);
      }
    }

    return r;
  },
};
