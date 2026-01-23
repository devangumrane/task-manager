import asyncHandler from "../../core/middlewares/asyncHandler.js";
import ApiError from "../../core/errors/ApiError.js";
import { gamificationService } from "./gamification.service.js";

export const gamificationController = {
    getStats: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const stats = await gamificationService.getUserStats(userId);
        res.json({ success: true, data: stats });
    }),
};
