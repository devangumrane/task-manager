// src/modules/attachments/attachment.controller.js

import fs from "fs";
import path from "path";
import asyncHandler from "../../core/middlewares/asyncHandler.js";
import ApiError from "../../core/errors/ApiError.js";
import { attachmentService } from "./attachment.service.js";

export const attachmentController = {
  // -----------------------------------------------
  // UPLOAD ATTACHMENT
  // -----------------------------------------------
  upload: asyncHandler(async (req, res) => {
    const workspaceId = Number(req.params.workspaceId);
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);

    if (!workspaceId) throw new ApiError("INVALID_WORKSPACE_ID", "Invalid workspace ID", 400);
    if (!projectId) throw new ApiError("INVALID_PROJECT_ID", "Invalid project ID", 400);
    if (!taskId) throw new ApiError("INVALID_TASK_ID", "Invalid task ID", 400);

    if (!req.file) {
      throw new ApiError("NO_FILE_UPLOADED", "No file uploaded", 400);
    }

    const file = req.file;

    // Build stable public URL
    const url = `/uploads/tasks/${workspaceId}/${projectId}/${taskId}/${file.filename}`;

    const attachment = await attachmentService.create({
      taskId,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, data: attachment });
  }),

  // -----------------------------------------------
  // LIST ATTACHMENTS
  // -----------------------------------------------
  list: asyncHandler(async (req, res) => {
    const workspaceId = Number(req.params.workspaceId);
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);

    if (!workspaceId) throw new ApiError("INVALID_WORKSPACE_ID", "Invalid workspace ID", 400);
    if (!projectId) throw new ApiError("INVALID_PROJECT_ID", "Invalid project ID", 400);
    if (!taskId) throw new ApiError("INVALID_TASK_ID", "Invalid task ID", 400);

    const attachments = await attachmentService.list(taskId);
    res.json({ success: true, data: attachments });
  }),

  // -----------------------------------------------
  // DELETE ATTACHMENT
  // -----------------------------------------------
  remove: asyncHandler(async (req, res) => {
    const workspaceId = Number(req.params.workspaceId);
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);
    const attachmentId = Number(req.params.attachmentId);

    if (!workspaceId) throw new ApiError("INVALID_WORKSPACE_ID", "Invalid workspace ID", 400);
    if (!projectId) throw new ApiError("INVALID_PROJECT_ID", "Invalid project ID", 400);
    if (!taskId) throw new ApiError("INVALID_TASK_ID", "Invalid task ID", 400);
    if (!attachmentId) throw new ApiError("INVALID_ATTACHMENT_ID", "Invalid attachment ID", 400);

    const attachment = await attachmentService.findById(attachmentId);
    if (!attachment) {
      throw new ApiError("ATTACHMENT_NOT_FOUND", "Attachment not found", 404);
    }

    await attachmentService.remove(attachmentId, req.user.id);

    // Remove file from disk
    const filePath = path.join(process.cwd(), attachment.url.replace(/^\//, ""));
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Failed to delete attachment file:", err);
      }
    }

    res.json({ success: true, data: null });
  }),
};
