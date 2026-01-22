import express from "express";
import { reminderController } from "./reminder.controller.js";
import { workspaceAccessGuard } from "../../core/middlewares/workspace-access.middleware.js";

const router = express.Router({ mergeParams: true });

router.post("/", workspaceAccessGuard, reminderController.create);
router.get("/", workspaceAccessGuard, reminderController.list);
router.delete("/:reminderId", workspaceAccessGuard, reminderController.remove);

export default router;
