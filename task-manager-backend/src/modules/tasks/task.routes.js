// src/modules/tasks/task.routes.js
import express from "express";
import { taskController } from "./task.controller.js";
import { workspaceAccessGuard } from "../../core/middlewares/workspace-access.middleware.js";
import attachmentRoutes from "../attachments/attachment.routes.js";
import reminderRoutes from "../reminders/reminder.routes.js";
import { workspaceRoleGuard } from "../../core/middlewares/workspace-role.middleware.js";
import commentRoutes from "../comments/comment.routes.js";

const router = express.Router({ mergeParams: true });

// mounted at: /api/v1/workspaces/:workspaceId/projects/:projectId/tasks

router.post(
  "/",
  workspaceAccessGuard,
  workspaceRoleGuard("member"),
  taskController.create
);

router.get(
  "/",
  workspaceAccessGuard,
  taskController.list
);

router.get(
  "/:taskId",
  workspaceAccessGuard,
  taskController.get
);

router.patch(
  "/:taskId",
  workspaceAccessGuard,
  workspaceRoleGuard("member"),
  taskController.update
);

// Mount attachments & reminders under /:taskId/*
router.use("/:taskId/attachments", attachmentRoutes);
router.use("/:taskId/reminders", reminderRoutes);

export default router;
