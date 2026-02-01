// src/modules/projects/project.routes.js
import express from "express";
import { projectController } from "./project.controller.js";
import taskRoutes from "../tasks/task.routes.js";
import { authenticate } from "../../core/middlewares/auth.middleware.js";

const router = express.Router();

// Mounted at: /api/v1/projects

// List user's projects
router.get("/", authenticate, projectController.list);

// Create project
router.post("/", authenticate, projectController.create);

// Get project
router.get("/:projectId", authenticate, projectController.get);

// Mount tasks under /:projectId/tasks
router.use("/:projectId/tasks", taskRoutes);

export default router;
