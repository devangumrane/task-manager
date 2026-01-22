import prisma from "../../core/database/prisma.js";
import { activityService } from "../activity/activity.service.js";
import { getEmitters } from "../../core/realtime/socket.js";
import ApiError from "../../core/errors/ApiError.js";

export const attachmentService = {
  async create({ taskId, filename, mimetype, size, url, userId }) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new ApiError("TASK_NOT_FOUND", "Task not found", 404);
    }

    let attachment;
    try {
      attachment = await prisma.attachment.create({
        data: { taskId, filename, mimetype, size, url },
      });
    } catch (err) {
      if (err?.code === "P2002") {
        throw new ApiError("DUPLICATE_ATTACHMENT", "Attachment already exists", 409);
      }
      throw err;
    }

    // -------------------------
    // Activity log (best-effort)
    // -------------------------
    try {
      await activityService.log({
        workspaceId: task.project.workspaceId,
        userId,
        taskId,
        projectId: task.projectId,
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
      emitters?.emitToWorkspace(task.project.workspaceId, "attachment.uploaded", {
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
    return prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id) {
    return prisma.attachment.findUnique({
      where: { id },
      include: { task: { include: { project: true } } },
    });
  },

  async remove(attachmentId, userId) {
    const record = await this.findById(attachmentId);

    if (!record) {
      throw new ApiError("ATTACHMENT_NOT_FOUND", "Attachment not found", 404);
    }

    // Delete DB record
    const removed = await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    // -------------------------
    // Activity log (best-effort)
    // -------------------------
    try {
      await activityService.log({
        workspaceId: record.task.project.workspaceId,
        userId,
        taskId: record.taskId,
        projectId: record.task.projectId,
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
      emitters?.emitToWorkspace(record.task.project.workspaceId, "attachment.deleted", {
        attachment: {
          id: attachmentId,
          taskId: record.taskId,
        },
        meta: { byUserId: userId },
      });
    } catch (emitErr) {
      console.error("emitters.emitToWorkspace (attachment.deleted) failed:", emitErr);
    }

    return removed;
  },
};
