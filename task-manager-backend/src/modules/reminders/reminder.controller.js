// src/modules/reminders/reminder.controller.js

import asyncHandler from "../../core/middlewares/asyncHandler.js";
import ApiError from "../../core/errors/ApiError.js";
import { z } from "zod";
import { reminderService } from "./reminder.service.js";

// -----------------------------
// Zod Schema
// -----------------------------
const createReminderSchema = z.object({
  reminderTime: z.string().datetime().or(z.number()),
  note: z.string().optional(),
});

export const reminderController = {
  // -----------------------------------------------------
  // CREATE REMINDER
  // -----------------------------------------------------
  create: asyncHandler(async (req, res) => {
    const workspaceId = Number(req.params.workspaceId);
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);

    if (!workspaceId) throw new ApiError("INVALID_WORKSPACE_ID", "Invalid workspace ID", 400);
    if (!projectId) throw new ApiError("INVALID_PROJECT_ID", "Invalid project ID", 400);
    if (!taskId) throw new ApiError("INVALID_TASK_ID", "Invalid task ID", 400);

    const parsed = createReminderSchema.parse(req.body);

    const reminder = await reminderService.createReminder({
      workspaceId,
      projectId,
      taskId,
      reminderTime: new Date(parsed.reminderTime),
      note: parsed.note,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: reminder });
  }),

  // -----------------------------------------------------
  // LIST REMINDERS FOR TASK
  // -----------------------------------------------------
  list: asyncHandler(async (req, res) => {
    const workspaceId = Number(req.params.workspaceId);
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);

    if (!workspaceId) throw new ApiError("INVALID_WORKSPACE_ID", "Invalid workspace ID", 400);
    if (!projectId) throw new ApiError("INVALID_PROJECT_ID", "Invalid project ID", 400);
    if (!taskId) throw new ApiError("INVALID_TASK_ID", "Invalid task ID", 400);

    const reminders = await reminderService.listReminders(taskId);
    res.json({ success: true, data: reminders });
  }),

  // -----------------------------------------------------
  // DELETE REMINDER
  // -----------------------------------------------------
  remove: asyncHandler(async (req, res) => {
    const workspaceId = Number(req.params.workspaceId);
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);
    const reminderId = Number(req.params.reminderId);

    if (!workspaceId) throw new ApiError("INVALID_WORKSPACE_ID", "Invalid workspace ID", 400);
    if (!projectId) throw new ApiError("INVALID_PROJECT_ID", "Invalid project ID", 400);
    if (!taskId) throw new ApiError("INVALID_TASK_ID", "Invalid task ID", 400);
    if (!reminderId) throw new ApiError("INVALID_REMINDER_ID", "Invalid reminder ID", 400);

    await reminderService.deleteReminder(reminderId, req.user.id);

    res.json({ success: true, data: null });
  }),
};
