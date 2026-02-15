import express from "express";
import { reminderController } from "./reminder.controller.js";
import { workspaceRoleGuard } from "../../core/middlewares/workspace-role.middleware.js";

const router = express.Router({ mergeParams: true });

router.post("/", workspaceRoleGuard("member"), reminderController.create);
router.get("/", workspaceRoleGuard("member"), reminderController.list);
router.delete("/:reminderId", workspaceRoleGuard("member"), reminderController.remove);

export default router;
