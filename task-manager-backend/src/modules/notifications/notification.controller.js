import asyncHandler from "express-async-handler";
import { notificationService } from "./notification.service.js";

export const notificationController = {
    listNotifications: asyncHandler(async (req, res) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const result = await notificationService.getUserNotifications(req.user.id, page, limit);

        res.json({
            success: true,
            data: result.notifications,
            meta: result.meta
        });
    }),

    markRead: asyncHandler(async (req, res) => {
        const { id } = req.params;
        await notificationService.markAsRead(id, req.user.id);
        res.json({ success: true, message: "Notification marked as read" });
    }),

    markAllRead: asyncHandler(async (req, res) => {
        await notificationService.markAllAsRead(req.user.id);
        res.json({ success: true, message: "All notifications marked as read" });
    })
};
