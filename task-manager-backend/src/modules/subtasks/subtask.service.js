import { SubTask, Task } from "../../models/index.js";
import ApiError from "../../core/errors/ApiError.js";

export const subtaskService = {
    async create(taskId, userId, title) {
        if (!title?.trim()) {
            throw new ApiError("INVALID_INPUT", "Title cannot be empty", 400);
        }

        const task = await Task.findByPk(taskId);
        if (!task) {
            throw new ApiError("NOT_FOUND", "Task not found", 404);
        }

        const subtask = await SubTask.create({
            task_id: taskId,
            title
        });

        return subtask;
    },

    async list(taskId) {
        return SubTask.findAll({
            where: { task_id: taskId },
            order: [["id", "ASC"]]
        });
    },

    async update(subtaskId, updates) {
        const subtask = await SubTask.findByPk(subtaskId);
        if (!subtask) throw new ApiError("NOT_FOUND", "Subtask not found", 404);

        await subtask.update(updates);
        return subtask;
    },

    async delete(subtaskId) {
        const subtask = await SubTask.findByPk(subtaskId);
        if (!subtask) throw new ApiError("NOT_FOUND", "Subtask not found", 404);

        await subtask.destroy();
        return true;
    }
};
