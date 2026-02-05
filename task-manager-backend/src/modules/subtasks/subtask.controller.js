import { subtaskService } from "./subtask.service.js";

export const subtaskController = {
    async create(req, res, next) {
        try {
            const { taskId } = req.params;
            const { title } = req.body;
            const subtask = await subtaskService.create(taskId, req.user.id, title);
            res.status(201).json({ success: true, data: subtask });
        } catch (error) {
            next(error);
        }
    },

    async list(req, res, next) {
        try {
            const { taskId } = req.params;
            const subtasks = await subtaskService.list(taskId);
            res.json({ success: true, data: subtasks });
        } catch (error) {
            next(error);
        }
    },

    async update(req, res, next) {
        try {
            const { subtaskId } = req.params;
            const updates = req.body;
            const subtask = await subtaskService.update(subtaskId, updates);
            res.json({ success: true, data: subtask });
        } catch (error) {
            next(error);
        }
    },

    async delete(req, res, next) {
        try {
            const { subtaskId } = req.params;
            await subtaskService.delete(subtaskId);
            res.json({ success: true, message: "Subtask deleted" });
        } catch (error) {
            next(error);
        }
    }
};
