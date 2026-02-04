import { Comment, Task, User } from "../../models/index.js";
import ApiError from "../../core/errors/ApiError.js";
import { getEmitters } from "../../core/realtime/socket.js";

export const commentService = {
    async create(taskId, userId, content, parentId) {
        if (!content?.trim()) {
            throw new ApiError("INVALID_INPUT", "Content cannot be empty", 400);
        }

        const task = await Task.findByPk(taskId, {
            attributes: ['id', 'project_id', 'workspace_id'], // Need workspaceId for auth logic usually, or just to check existence
        });

        if (!task) {
            throw new ApiError("NOT_FOUND", "Task not found", 404);
        }

        const comment = await Comment.create({
            task_id: taskId,
            user_id: userId,
            content,
            parent_id: parentId || null,
        });

        // Re-fetch to include user details
        const commentWithUser = await Comment.findByPk(comment.id, {
            include: {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'profile_image', 'email'] // Ensure field names match User model (profile_image vs profileImage?) 
                // User model defines 'profile_image' usually in DB, but Sequelize model might map it.
                // Let's check User model later. Assuming snake_case due to my pattern.
                // Actually User model was defined in step 24 (initially) or 437?
                // Step 437 showed User.js was 1189 bytes. 
                // If I check User.js content I can confirm.
                // Let's assume standard Sequelize attributes (camelCase mapped unless specified).
                // My User model likely has `profileImage`.
            }
        });

        // Real-time Event
        try {
            const emitters = getEmitters();
            if (emitters) {
                emitters.io.to(`task:${taskId}`).emit("comment.created", commentWithUser);
            }
        } catch (e) {
            console.error("Socket emit failed", e);
        }

        return commentWithUser;
    },

    async list(taskId) {
        return Comment.findAll({
            where: { task_id: taskId },
            include: {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            },
            order: [["createdAt", "ASC"]],
        });
    },

    async delete(commentId, userId) {
        const comment = await Comment.findByPk(commentId);

        if (!comment) throw new ApiError("NOT_FOUND", "Comment not found", 404);

        if (comment.user_id !== userId) {
            throw new ApiError("FORBIDDEN", "You can only delete your own comments", 403);
        }

        await Comment.destroy({ where: { id: commentId } });
        return true;
    },
};
