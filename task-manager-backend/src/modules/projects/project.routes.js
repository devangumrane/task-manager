// src/modules/projects/project.routes.js
import express from "express";
import { projectController } from "./project.controller.js";
import { workspaceAccessGuard } from "../../core/middlewares/workspace-access.middleware.js";
import taskRoutes from "../tasks/task.routes.js";
import { workspaceRoleGuard } from "../../core/middlewares/workspace-role.middleware.js";


const router = express.Router({ mergeParams: true });

// mounted at: /api/v1/workspaces/:workspaceId/projects

// List projects
router.get("/", workspaceAccessGuard, projectController.list);

// Create project
router.post("/", workspaceAccessGuard, workspaceRoleGuard("admin"), projectController.create);

// Get project
router.get("/:projectId", workspaceAccessGuard, projectController.get);

// Mount tasks under /:projectId/tasks
router.use("/:projectId/tasks", taskRoutes);

export default router;
