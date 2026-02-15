// src/modules/activity/activity.routes.js
import express from "express";
import { activityController } from "./activity.controller.js";
import { workspaceRoleGuard } from "../../core/middlewares/workspace-role.middleware.js";

const router = express.Router({ mergeParams: true });

// This file handles workspace-scoped activity and is mounted by workspace.routes.js
// Mounted at: /api/v1/workspaces/:workspaceId/activity

router.get("/", workspaceRoleGuard("member"), activityController.listWorkspace);

export default router;
