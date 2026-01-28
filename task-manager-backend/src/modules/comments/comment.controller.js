import asyncHandler from "../../core/middlewares/asyncHandler.js";
import { commentService } from "./comment.service.js";
import { z } from "zod";

const createCommentSchema = z.object({
    content: z.string().min(1),
    parentId: z.number().optional(),
});

export const commentController = {
    create: asyncHandler(async (req, res) => {
        const taskId = Number(req.params.taskId);
        const { content, parentId } = createCommentSchema.parse(req.body);

        const comment = await commentService.create(taskId, req.user.id, content, parentId);
        res.status(201).json({ success: true, data: comment });
    }),

    list: asyncHandler(async (req, res) => {
        const taskId = Number(req.params.taskId);
        const comments = await commentService.list(taskId);
        res.json({ success: true, data: comments });
    }),

    delete: asyncHandler(async (req, res) => {
        const commentId = Number(req.params.commentId);
        await commentService.delete(commentId, req.user.id);
        res.json({ success: true, message: "Comment deleted" });
    }),
};
