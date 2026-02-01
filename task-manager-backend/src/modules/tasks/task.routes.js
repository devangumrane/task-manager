// src/modules/tasks/task.routes.js
import express from "express";
import { taskController } from "./task.controller.js";
import { requireAuth as authenticate } from "../../core/middlewares/auth.middleware.js";

const router = express.Router({ mergeParams: true });

// Mounted at: /api/v1/projects/:projectId/tasks
// AND/OR /api/v1/tasks (if we mount it globally for GET /:taskId)

router.post(
  "/",
  authenticate,
  taskController.create
);

router.get(
  "/",
  authenticate,
  taskController.list
);

router.get(
  "/:taskId",
  authenticate,
  taskController.get
);

router.patch(
  "/:taskId",
  authenticate,
  taskController.update
);

// We might want to remove attachment/reminder routes for now or leave them routed if they don't depend on workspace
// router.use("/:taskId/attachments", attachmentRoutes);
// router.use("/:taskId/reminders", reminderRoutes);

export default router;
