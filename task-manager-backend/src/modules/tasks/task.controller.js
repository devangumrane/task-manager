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
  // POST /projects/:projectId/tasks
  // --------------------------------------------------------
  create: asyncHandler(async (req, res) => {
    const projectId = Number(req.params.projectId);

    if (!projectId) {
      throw new ApiError("INVALID_PROJECT_ID", "Project ID is invalid", 400);
    }

    const parsed = createTaskSchema.parse(req.body);

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
  // GET /projects/:projectId/tasks
  // --------------------------------------------------------
  list: asyncHandler(async (req, res) => {
    const projectId = Number(req.params.projectId);

    if (!projectId) {
      throw new ApiError("INVALID_PROJECT_ID", "Project ID is invalid", 400);
    }

    const tasks = await taskService.listTasks(projectId, req.user.id);

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

    const task = await taskService.getTask(taskId, req.user.id);

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
};
