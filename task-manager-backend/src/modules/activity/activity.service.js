import { ActivityLog, User, Task, Project } from "../../models/index.js";
import ApiError from "../../core/errors/ApiError.js";
import { ActivityFormatter } from "../../core/activity/formatters.js";

export const activityService = {
  /**
   * Log an activity event.
   * This function MUST NEVER break core flows.
   */
  async log({
    workspaceId = null,
    userId,
    taskId = null,
    projectId = null,
    type,
    metadata = {},
  }) {
    if (!userId) {
      throw new ApiError("INVALID_INPUT", "userId is required for logging", 400);
    }

    if (!type) {
      throw new ApiError("INVALID_INPUT", "type is required for logging", 400);
    }

    // All activities use standardized formatting
    const formatted = ActivityFormatter.format(type, metadata);

    try {
      return await ActivityLog.create({
        workspace_id: workspaceId,
        user_id: userId,
        task_id: taskId,
        project_id: projectId,
        type,
        title: formatted.title,
        icon: formatted.icon,
        metadata: formatted.details,
      });
    } catch (err) {
      // If DB error occurs, do NOT crash core workflows
      console.error("activityService.log failed:", err);
      return null;
    }
  },

  /**
   * List workspace activity logs with stable pagination.
   */
  async listByWorkspace(workspaceId, { page = 1, perPage = 25 } = {}) {
    if (!workspaceId) {
      throw new ApiError("INVALID_INPUT", "workspaceId is required", 400);
    }

    // Sanitize pagination
    page = Number(page);
    perPage = Number(perPage);

    if (Number.isNaN(page) || page < 1) page = 1;
    if (Number.isNaN(perPage) || perPage < 1 || perPage > 100) perPage = 25;

    const offset = (page - 1) * perPage;

    const { count, rows } = await ActivityLog.findAndCountAll({
      where: { workspace_id: workspaceId },
      order: [["createdAt", "DESC"]],
      offset,
      limit: perPage,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Task,
          as: "task",
          attributes: ["id", "title"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["id", "title"], // Project model uses 'title' not 'name' 
        },
      ],
    });

    return {
      items: rows,
      meta: {
        page,
        perPage,
        total: count,
        totalPages: Math.max(1, Math.ceil(count / perPage)),
      },
    };
  },
};
