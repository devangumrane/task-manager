import { Attachment, Task, Project } from "../../models/index.js";
import { activityService } from "../activity/activity.service.js";
import { getEmitters } from "../../core/realtime/socket.js";
import ApiError from "../../core/errors/ApiError.js";

export const attachmentService = {
  async create({ taskId, filename, mimetype, size, url, userId }) {
    const task = await Task.findByPk(taskId, {
      include: {
        model: Project,
        as: 'project',
        attributes: ['id', 'workspace_id']
      },
    });

    if (!task) {
      throw new ApiError("TASK_NOT_FOUND", "Task not found", 404);
    }

    let attachment;
    try {
      attachment = await Attachment.create({
        task_id: taskId,
        filename,
        mimetype,
        size,
        url,
      });
    } catch (err) {
      // Unique constraint?
      throw err;
    }

    // -------------------------
    // Activity log (best-effort)
    // -------------------------
    try {
      await activityService.log({
        workspaceId: task.project.workspace_id,
        userId,
        taskId,
        projectId: task.project_id,
        type: "attachment.uploaded",
        metadata: {
          id: attachment.id,
          filename: attachment.filename,
        },
      });
    } catch (logErr) {
      console.error("activityService.log (attachment.uploaded) failed:", logErr);
    }

    // -------------------------
    // Emit socket event (best-effort)
    // -------------------------
    try {
      const emitters = getEmitters();
      emitters?.emitToWorkspace(task.project.workspace_id, "attachment.uploaded", {
        attachment: {
          id: attachment.id,
          filename: attachment.filename,
          taskId,
          url,
        },
        meta: { byUserId: userId },
      });
    } catch (emitErr) {
      console.error("emitters.emitToWorkspace (attachment.uploaded) failed:", emitErr);
    }

    return attachment;
  },

  async list(taskId) {
    return Attachment.findAll({
      where: { task_id: taskId },
      order: [["createdAt", "DESC"]],
    });
  },

  async findById(id) {
    // Helper to include task and project for authorization checks
    return Attachment.findByPk(id, {
      include: {
        model: Task,
        as: 'task',
        include: {
          model: Project,
          as: 'project'
        }
      }
    });
  },

  async remove(attachmentId, userId) {
    const record = await this.findById(attachmentId);

    if (!record) {
      throw new ApiError("ATTACHMENT_NOT_FOUND", "Attachment not found", 404);
    }

    // Delete DB record
    await Attachment.destroy({ where: { id: attachmentId } });

    // -------------------------
    // Activity log (best-effort)
    // -------------------------
    try {
      await activityService.log({
        workspaceId: record.task.project.workspace_id,
        userId,
        taskId: record.task_id,
        projectId: record.task.project_id,
        type: "attachment.deleted",
        metadata: {
          id: attachmentId,
          filename: record.filename,
        },
      });
    } catch (logErr) {
      console.error("activityService.log (attachment.deleted) failed:", logErr);
    }

    // -------------------------
    // Emit socket event (best-effort)
    // -------------------------
    try {
      const emitters = getEmitters();
      emitters?.emitToWorkspace(record.task.project.workspace_id, "attachment.deleted", {
        attachment: {
          id: attachmentId,
          taskId: record.task_id,
        },
        meta: { byUserId: userId },
      });
    } catch (emitErr) {
      console.error("emitters.emitToWorkspace (attachment.deleted) failed:", emitErr);
    }

    return true;
  },
};
