import asyncHandler from "../../core/middlewares/asyncHandler.js";
import ApiError from "../../core/errors/ApiError.js";

import {
  createTaskSchema,
  updateTaskSchema,
} from "./task.schemas.js";

import { taskService } from "./task.service.js";

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
};
