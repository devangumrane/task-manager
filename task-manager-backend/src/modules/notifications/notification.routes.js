import express from "express";
import { notificationController } from "./notification.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", notificationController.listNotifications);
router.patch("/read-all", notificationController.markAllRead);
router.patch("/:id/read", notificationController.markRead);

export default router;
