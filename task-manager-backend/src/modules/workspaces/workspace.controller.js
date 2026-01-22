// src/modules/workspaces/workspace.controller.js

import asyncHandler from "../../core/middlewares/asyncHandler.js";
import ApiError from "../../core/errors/ApiError.js";

import {
  createWorkspaceSchema,
  addMemberSchema,
} from "./workspace.schemas.js";

import { workspaceService } from "./workspace.service.js";

export const workspaceController = {
  // --------------------------------------------------------
  // Create workspace
  // --------------------------------------------------------
  create: asyncHandler(async (req, res) => {
    const parsed = createWorkspaceSchema.parse(req.body);

    const workspace = await workspaceService.createWorkspace(
      req.user.id,
      parsed
    );

    res.status(201).json({ success: true, data: workspace });
  }),

  // --------------------------------------------------------
  // List all workspaces for the logged-in user
  // --------------------------------------------------------
  list: asyncHandler(async (req, res) => {
    const workspaces = await workspaceService.listUserWorkspaces(req.user.id);

    res.json({ success: true, data: workspaces });
  }),

  // --------------------------------------------------------
  // Get single workspace
  // --------------------------------------------------------
  get: asyncHandler(async (req, res) => {
    const workspaceId = Number(req.params.workspaceId);
    if (!workspaceId) {
      throw new ApiError(
        "INVALID_WORKSPACE_ID",
        "Invalid workspace ID",
        400
      );
    }

    const workspace = await workspaceService.getWorkspace(workspaceId);
    if (!workspace) {
      throw new ApiError(
        "WORKSPACE_NOT_FOUND",
        "Workspace not found",
        404
      );
    }

    res.json({ success: true, data: workspace });
  }),

  // --------------------------------------------------------
  // Add member to workspace (admin only)
  // --------------------------------------------------------
  addMember: asyncHandler(async (req, res) => {
    const workspaceId = Number(req.params.workspaceId);
    if (!workspaceId) {
      throw new ApiError(
        "INVALID_WORKSPACE_ID",
        "Invalid workspace ID",
        400
      );
    }

    const parsed = addMemberSchema.parse(req.body);

    const member = await workspaceService.addMember(workspaceId, parsed);

    res.json({ success: true, data: member });
  }),
};
