import { Tag, TaskTag, Task } from "../../models/index.js";
import ApiError from "../../core/errors/ApiError.js";
import { assertWorkspaceMember } from "../../core/authorization/workspace.guard.js";

export const tagsService = {
    // --------------------------------------------------------
    // CREATE TAG (Workspace Level)
    // --------------------------------------------------------
    async createTag(userId, workspaceId, { name, color }) {
        await assertWorkspaceMember(null, userId, workspaceId);

        // simple normalization
        const normalizedName = name.trim();

        return Tag.create({
            workspace_id: workspaceId,
            name: normalizedName,
            color
        });
    },

    // --------------------------------------------------------
    // LIST TAGS (Workspace Level)
    // --------------------------------------------------------
    async listTags(userId, workspaceId) {
        await assertWorkspaceMember(null, userId, workspaceId);
        return Tag.findAll({
            where: { workspace_id: workspaceId },
            order: [['name', 'ASC']]
        });
    },

    // --------------------------------------------------------
    // ATTACH TAG TO TASK
    // --------------------------------------------------------
    async attachTag(userId, taskId, tagId) {
        const task = await Task.findByPk(taskId, { include: 'project' });
        if (!task) throw new ApiError("TASK_NOT_FOUND", "Task not found", 404);

        await assertWorkspaceMember(null, userId, task.project.workspace_id);

        // Verify tag belongs to same workspace
        const tag = await Tag.findByPk(tagId);
        if (!tag || tag.workspace_id !== task.project.workspace_id) {
            throw new ApiError("INVALID_TAG", "Tag invalid or from different workspace", 400);
        }

        try {
            await TaskTag.create({
                task_id: taskId,
                tag_id: tagId
            });
        } catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                return; // Already attached, ignore
            }
            throw err;
        }
    },

    // --------------------------------------------------------
    // DETACH TAG FROM TASK
    // --------------------------------------------------------
    async detachTag(userId, taskId, tagId) {
        const task = await Task.findByPk(taskId, { include: 'project' });
        if (!task) throw new ApiError("TASK_NOT_FOUND", "Task not found", 404);

        await assertWorkspaceMember(null, userId, task.project.workspace_id);

        await TaskTag.destroy({
            where: {
                task_id: taskId,
                tag_id: tagId
            }
        });
    }
};
