import asyncHandler from "../../core/middlewares/asyncHandler.js";
import { tagsService } from "./tags.service.js";

export const tagsController = {
    create: asyncHandler(async (req, res) => {
        const workspaceId = Number(req.params.workspaceId);
        const { name, color } = req.body;

        const tag = await tagsService.createTag(req.user.id, workspaceId, { name, color });
        res.status(201).json({ success: true, data: tag });
    }),

    list: asyncHandler(async (req, res) => {
        const workspaceId = Number(req.params.workspaceId);
        const tags = await tagsService.listTags(req.user.id, workspaceId);
        res.json({ success: true, data: tags });
    }),

    attach: asyncHandler(async (req, res) => {
        const taskId = Number(req.params.taskId);
        const { tagId } = req.body;
        await tagsService.attachTag(req.user.id, taskId, tagId);
        res.json({ success: true, message: "Tag attached" });
    }),

    detach: asyncHandler(async (req, res) => {
        const taskId = Number(req.params.taskId);
        const tagId = Number(req.params.tagId);
        await tagsService.detachTag(req.user.id, taskId, tagId);
        res.json({ success: true, message: "Tag detached" });
    }),
};
