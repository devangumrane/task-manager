// src/modules/projects/project.controller.js

import asyncHandler from "../../core/middlewares/asyncHandler.js";
import ApiError from "../../core/errors/ApiError.js";


import { createProjectSchema } from "./project.schemas.js";
import { projectService } from "./project.service.js";

export const projectController = {
  // --------------------------------------------------------
  // Create a new project inside a workspace
  // --------------------------------------------------------
  create: asyncHandler(async (req, res) => {
    const workspaceId = Number(req.params.workspaceId);

    if (!workspaceId) {
      throw new ApiError(
        "INVALID_WORKSPACE_ID",
        "Invalid or missing workspace ID",
        400
      );
    }

    const parsed = createProjectSchema.parse(req.body);

    const project = await projectService.createProject(
      workspaceId,
      req.user.id,
      parsed
    );

    res.status(201).json({ success: true, data: project });
  }),

  // --------------------------------------------------------
  // List projects inside a workspace
  // --------------------------------------------------------
  list: asyncHandler(async (req, res) => {
    const workspaceId = Number(req.params.workspaceId);

    if (!workspaceId) {
      throw new ApiError(
        "INVALID_WORKSPACE_ID",
        "Invalid or missing workspace ID",
        400
      );
    }

    const projects = await projectService.listWorkspaceProjects(workspaceId);

    res.json({ success: true, data: projects });
  }),

  // --------------------------------------------------------
  // Get a single project inside workspace
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

    const project = await projectService.getProject(projectId);

    if (!project) {
      throw new ApiError(
        "PROJECT_NOT_FOUND",
        "Project not found",
        404
      );
    }

    res.json({ success: true, data: project });
  }),
};
