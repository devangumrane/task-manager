import prisma from "../../core/database/prisma.js";
import ApiError from "../../core/errors/ApiError.js";
import { getEmitters } from "../../core/realtime/socket.js";

export const commentService = {
    async create(taskId, userId, content, parentId) {
        if (!content?.trim()) {
            throw new ApiError("INVALID_INPUT", "Content cannot be empty", 400);
        }

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: { id: true, projectId: true },
        });

        if (!task) {
            throw new ApiError("NOT_FOUND", "Task not found", 404);
        }

        const comment = await prisma.comment.create({
            data: {
                taskId,
                userId,
                content,
                parentId: parentId || null,
            },
            include: {
                user: { select: { id: true, name: true, profileImage: true, email: true } },
            },
        });

        // Real-time Event
        try {
            const emitters = getEmitters();
            if (emitters) {
                // We need to know the workspace ID to broadcast correctly.
                // A query might be needed or we rely on the client to subscribe to Task events?
                // Usually we broadcast to a Room: `task:${taskId}` or `project:${projectId}`.
                // For now, let's assume we broadcast to the task room.
                emitters.io.to(`task:${taskId}`).emit("comment.created", comment);
            }
        } catch (e) {
            console.error("Socket emit failed", e);
        }

        return comment;
    },

    async list(taskId) {
        return prisma.comment.findMany({
            where: { taskId },
            include: {
                user: { select: { id: true, name: true, profileImage: true } },
            },
            orderBy: { createdAt: "asc" },
        });
    },

    async delete(commentId, userId) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment) throw new ApiError("NOT_FOUND", "Comment not found", 404);

        if (comment.userId !== userId) {
            throw new ApiError("FORBIDDEN", "You can only delete your own comments", 403);
        }

        await prisma.comment.delete({ where: { id: commentId } });
        return true;
    },
};
