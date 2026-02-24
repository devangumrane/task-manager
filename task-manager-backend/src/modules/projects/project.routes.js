// src/modules/projects/project.routes.js
import express from "express";
import { projectController } from "./project.controller.js";
import taskRoutes from "../tasks/task.routes.js";
import { workspaceRoleGuard } from "../../core/middlewares/workspace-role.middleware.js";


const router = express.Router({ mergeParams: true });

// mounted at: /api/v1/workspaces/:workspaceId/projects

// List projects
router.get("/", workspaceRoleGuard("member"), projectController.list);

// Create project
router.post("/", workspaceRoleGuard("admin"), projectController.create);

// Get project
router.get("/:projectId", workspaceRoleGuard("member"), projectController.get);

// Delete project (creator or workspace admin)
router.delete(
    "/:projectId",
    workspaceRoleGuard("member"),
    projectController.delete
);

// Mount tasks under /:projectId/tasks
router.use("/:projectId/tasks", taskRoutes);

export default router;
