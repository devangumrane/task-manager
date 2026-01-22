// src/modules/activity/activity.service.js
import prisma from "../../core/database/prisma.js";
import ApiError from "../../core/errors/ApiError.js";
import { ActivityFormatter } from "../../core/activity/formatters.js";
import { EVENTS } from "../../core/realtime/events.js";

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
      return await prisma.activityLog.create({
        data: {
          workspaceId,
          userId,
          taskId,
          projectId,
          type,
          title: formatted.title,
          icon: formatted.icon,
          metadata: formatted.details,
        },
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

    const skip = (page - 1) * perPage;

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
        include: {
          user: { select: { id: true, name: true, email: true } },
          task: { select: { id: true, title: true } },
          project: { select: { id: true, name: true } },
        },
      }),
      prisma.activityLog.count({ where: { workspaceId } }),
    ]);

    return {
      items,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
      },
    };
  },
};
