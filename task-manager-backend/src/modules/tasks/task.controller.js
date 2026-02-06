import asyncHandler from "../../core/middlewares/asyncHandler.js";
import ApiError from "../../core/errors/ApiError.js";

import {
  createTaskSchema,
  updateTaskSchema,
} from "./task.schemas.js";

import { taskService } from "./task.service.js";
import { dependencyService } from "./task.dependency.service.js";
import { timeTrackingService } from "./time.entry.service.js";

export const taskController = {
  // --------------------------------------------------------
  // Create task inside project
  // POST /workspaces/:workspaceId/projects/:projectId/tasks
  // --------------------------------------------------------
  create: asyncHandler(async (req, res) => {
    const workspaceId = Number(req.params.workspaceId);
    const projectId = Number(req.params.projectId);

    if (!workspaceId) {
      throw new ApiError("INVALID_WORKSPACE_ID", "Workspace ID is invalid", 400);
    }

    if (!projectId) {
      throw new ApiError("INVALID_PROJECT_ID", "Project ID is invalid", 400);
    }

    const parsed = createTaskSchema.parse(req.body);

    // ✅ CREATE TASK (not list)
    const task = await taskService.createTask(
      projectId,
      req.user.id,
      parsed
    );

    res.status(201).json({
      success: true,
      data: task,
    });
  }),

  // --------------------------------------------------------
  // List tasks inside project
  // GET /workspaces/:workspaceId/projects/:projectId/tasks
  // --------------------------------------------------------
  list: asyncHandler(async (req, res) => {
    const workspaceId = Number(req.params.workspaceId);
    const projectId = Number(req.params.projectId);

    if (!workspaceId) {
      throw new ApiError("INVALID_WORKSPACE_ID", "Workspace ID is invalid", 400);
    }

    if (!projectId) {
      throw new ApiError("INVALID_PROJECT_ID", "Project ID is invalid", 400);
    }

    const tasks = await taskService.listTasks(projectId);

    res.json({
      success: true,
      data: tasks,
    });
  }),

  // --------------------------------------------------------
  // Get single task
  // GET /tasks/:taskId
  // --------------------------------------------------------
  get: asyncHandler(async (req, res) => {
    const taskId = Number(req.params.taskId);

    if (!taskId) {
      throw new ApiError("INVALID_TASK_ID", "Task ID is invalid", 400);
    }

    const task = await taskService.getTask(taskId);

    res.json({
      success: true,
      data: task,
    });
  }),

  // --------------------------------------------------------
  // Update task
  // PATCH /tasks/:taskId
  // --------------------------------------------------------
  update: asyncHandler(async (req, res) => {
    const taskId = Number(req.params.taskId);

    if (!taskId) {
      throw new ApiError("INVALID_TASK_ID", "Task ID is invalid", 400);
    }

    const parsed = updateTaskSchema.parse(req.body);

    const task = await taskService.updateTask(
      taskId,
      parsed,
      req.user.id
    );

    res.json({
      success: true,
      data: task,
    });
  }),
  // --------------------------------------------------------
  // Fail task
  // POST /tasks/:taskId/fail
  // --------------------------------------------------------
  fail: asyncHandler(async (req, res) => {
    const taskId = Number(req.params.taskId);
    const { reason } = req.body;

    if (!taskId) {
      throw new ApiError("INVALID_TASK_ID", "Task ID is invalid", 400);
    }

    const failedTask = await taskService.failTask(taskId, req.user.id, reason);

    res.status(201).json({
      success: true,
      data: failedTask,
    });
  }),
  delete: asyncHandler(async (req, res) => {
    const taskId = Number(req.params.taskId);

    if (!taskId) {
      throw new ApiError("INVALID_TASK_ID", "Task ID is invalid", 400);
    }

    await taskService.deleteTask(taskId, req.user.id);

    res.json({
      success: true,
      message: "Task deleted successfully"
    });
  }),

  // --------------------------------------------------------
  // Dependencies
  // --------------------------------------------------------
  addDependency: asyncHandler(async (req, res) => {
    const blockedId = Number(req.params.taskId);
    const { blockerId } = req.body; // Expect JSON { blockerId: 123 }

    if (!blockedId || !blockerId) {
      throw new ApiError("INVALID_INPUT", "Blocked ID and Blocker ID required", 400);
    }

    await dependencyService.addDependency(req.user.id, { blockerId, blockedId });

    res.status(201).json({ success: true, message: "Dependency added" });
  }),

  removeDependency: asyncHandler(async (req, res) => {
    const blockedId = Number(req.params.taskId);
    const blockerId = Number(req.params.blockerId);

    if (!blockedId || !blockerId) {
      throw new ApiError("INVALID_INPUT", "IDs required", 400);
    }

    await dependencyService.removeDependency(req.user.id, { blockerId, blockedId });
    res.json({ success: true, message: "Dependency removed" });
  }),

  // --------------------------------------------------------
  // Time Tracking
  // --------------------------------------------------------
  startTimer: asyncHandler(async (req, res) => {
    const taskId = Number(req.params.taskId);
    const entry = await timeTrackingService.startTimer(req.user.id, taskId);
    res.status(201).json({ success: true, data: entry });
  }),

  stopTimer: asyncHandler(async (req, res) => {
    // Stop whatever is running for this user
    const entry = await timeTrackingService.stopTimer(req.user.id);
    res.json({ success: true, data: entry });
  }),
};
