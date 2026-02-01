// src/modules/projects/project.controller.js

import asyncHandler from "../../core/middlewares/asyncHandler.js";
import ApiError from "../../core/errors/ApiError.js";

import { createProjectSchema } from "./project.schemas.js";
import { projectService } from "./project.service.js";

export const projectController = {
  // --------------------------------------------------------
  // Create a new project
  // --------------------------------------------------------
  create: asyncHandler(async (req, res) => {
    // Validate body
    const parsed = createProjectSchema.parse(req.body);

    const project = await projectService.createProject(
      req.user.id,
      parsed
    );

    res.status(201).json({ success: true, data: project });
  }),

  // --------------------------------------------------------
  // List user's projects
  // --------------------------------------------------------
  list: asyncHandler(async (req, res) => {
    const projects = await projectService.listUserProjects(req.user.id);
    res.json({ success: true, data: projects });
  }),

  // --------------------------------------------------------
  // Get a single project
  // --------------------------------------------------------
  get: asyncHandler(async (req, res) => {
    const projectId = Number(req.params.projectId);

    if (!projectId) {
      throw new ApiError(
        "INVALID_PROJECT_ID",
        "Invalid or missing project ID",
        400
      );
    }

    const project = await projectService.getProject(projectId, req.user.id);

    res.json({ success: true, data: project });
  }),
};
