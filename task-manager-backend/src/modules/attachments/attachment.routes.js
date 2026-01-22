// src/modules/attachments/attachment.routes.js
import express from "express";
import { attachmentController } from "./attachment.controller.js";
import { workspaceAccessGuard } from "../../core/middlewares/workspace-access.middleware.js";
import { taskUpload } from "../../core/uploads/multer.js";
import { workspaceRoleGuard } from "../../core/middlewares/workspace-role.middleware.js";

const router = express.Router({ mergeParams: true });

// Note: mounted at:
// /api/v1/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/attachments

router.post("/", workspaceAccessGuard, workspaceRoleGuard("member"), taskUpload.single("file"), attachmentController.upload);
router.get("/", workspaceAccessGuard, attachmentController.list);
router.delete("/:attachmentId", workspaceAccessGuard, workspaceRoleGuard("member"), attachmentController.remove);

export default router;
