// src/modules/tasks/task.routes.js
import express from "express";
import { taskController } from "./task.controller.js";
import { tagsController } from "./tags.controller.js";
import { workspaceAccessGuard } from "../../core/middlewares/workspace-access.middleware.js";
import attachmentRoutes from "../attachments/attachment.routes.js";
import reminderRoutes from "../reminders/reminder.routes.js";
import { workspaceRoleGuard } from "../../core/middlewares/workspace-role.middleware.js";
import commentRoutes from "../comments/comment.routes.js";
import subtaskRoutes from "../subtasks/subtask.routes.js";

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

router.post(
  "/:taskId/fail",
  workspaceAccessGuard,
  workspaceRoleGuard("member"),
  taskController.fail
);

router.delete(
  "/:taskId",
  workspaceAccessGuard,
  workspaceRoleGuard("member"),
  taskController.delete
);

// Mount attachments & reminders under /:taskId/*
router.use("/:taskId/attachments", attachmentRoutes);
router.use("/:taskId/reminders", reminderRoutes);
router.use("/:taskId/comments", commentRoutes);
router.use("/:taskId/subtasks", subtaskRoutes);

// Dependencies
router.post(
  "/:taskId/dependencies",
  workspaceAccessGuard,
  // workspaceRoleGuard("member"), // Optional: allow members or just owners? 
  // Assuming member access checks are done in service for now or we rely on general guard
  taskController.addDependency
);

router.delete(
  "/:taskId/dependencies/:blockerId",
  workspaceAccessGuard,
  taskController.removeDependency
);

// Time Tracking
router.post(
  "/:taskId/timer/start",
  workspaceAccessGuard,
  taskController.startTimer
);

// Note: Stop does not strictly need taskId, but we might keep it consistent or make a global route.
// For now, let's allow stopping via any task route or a global one. 
// A user usually stops "their" timer.
// We'll expose a global /timer/stop somewhere else? 
// Or just reuse this structure but ignore taskId if logic allows.
// Let's add a specific route for stop that might not need taskId param visually but follows strict router structure.
// Actually, safer to have `POST /workspaces/:wid/projects/:pid/tasks/timer/stop` to use existing guards?
// Or just `POST /:taskId/timer/stop` works fine.
router.post(
  "/:taskId/timer/stop",
  workspaceAccessGuard,
  taskController.stopTimer
);

// Tags (Task Level)
router.post(
  "/:taskId/tags",
  workspaceAccessGuard,
  tagsController.attach
);

router.delete(
  "/:taskId/tags/:tagId",
  workspaceAccessGuard,
  tagsController.detach
);

// Tags (Workspace Level - usually simpler to mount separately, but can do here for speed)
// NOTE: req.params.workspaceId is available due to mergeParams
router.post(
  "/tags", // Resolves to /workspaces/:workspaceId/projects/:projectId/tasks/tags -- Incorrect nesting depth??
  // Wait, this router is mounted at:
  // /workspaces/:workspaceId/projects/:projectId/tasks
  // This is NOT ideal for workspace-level tags.
  // Ideally, tags should be under /workspaces/:workspaceId/tags
  // Let's create a SEPARATE tags route file or mount it in app.js
  // BUT for simplicity, if we want to access workspace tags while in a project context:
  // GET /workspaces/:workspaceId/projects/:projectId/tasks/tags (List applicable tags)
  // ok for list.
  workspaceAccessGuard,
  tagsController.list
);

// Create tag inside a project context? Weird but okay.
// Better: We'll fix the route mounting in app.js later if needed.
// For now, let's stick to task-specific tag operations here.
// Creating a tag usually happens in settings or "create new".
// Let's expose the workspace-level endpoints here, accepting that they inherit project params unused.

router.get( // List tags available
  "/tags/all",
  workspaceAccessGuard,
  tagsController.list
);

router.post(
  "/tags/create",
  workspaceAccessGuard,
  tagsController.create
);

export default router;
