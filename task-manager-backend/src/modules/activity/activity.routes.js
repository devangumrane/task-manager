// src/modules/activity/activity.routes.js
import express from "express";
import { activityController } from "./activity.controller.js";
import { workspaceAccessGuard } from "../../core/middlewares/workspace-access.middleware.js";

const router = express.Router({ mergeParams: true });

// This file handles workspace-scoped activity and is mounted by workspace.routes.js
// Mounted at: /api/v1/workspaces/:workspaceId/activity

router.get("/", workspaceAccessGuard, activityController.listWorkspace);

export default router;
