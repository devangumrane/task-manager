// src/modules/workspaces/workspace.routes.js
import express from "express";
import { workspaceController } from "./workspace.controller.js";
import { workspaceAccessGuard } from "../../core/middlewares/workspace-access.middleware.js";
import { workspaceRoleGuard } from "../../core/middlewares/workspace-role.middleware.js";
import { workspaceOwnerGuard } from "../../core/middlewares/workspace-owner.middleware.js";

import projectRoutes from "../projects/project.routes.js";
import activityRoutes from "../activity/activity.routes.js";

const router = express.Router();

// Create workspace
router.post("/", workspaceController.create);

// List workspaces
router.get("/", workspaceController.list);

// Get workspace details
router.get("/:workspaceId", workspaceAccessGuard, workspaceController.get);

// Add member (admin only)
router.post(
  "/:workspaceId/members",
  workspaceAccessGuard,
  workspaceOwnerGuard,
  workspaceController.addMember
);

// Mount project routes under /:workspaceId/projects
router.use("/:workspaceId/projects", projectRoutes);

// Mount workspace-level activity under /:workspaceId/activity
router.use("/:workspaceId/activity", activityRoutes);

export default router;
