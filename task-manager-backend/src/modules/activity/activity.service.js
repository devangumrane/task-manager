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
    projectId,
    userId,
    type, // mapped to 'action'
    metadata = {},
  }) {
    if (!userId || !projectId) {
      // console.warn("activityService.log: userId and projectId are required", { userId, projectId });
      return null;
    }

    try {
      return await prisma.activityLog.create({
        data: {
          projectId,
          userId,
          action: type,
          metadata, // Store rich details here
        },
      });
    } catch (err) {
      console.error("activityService.log failed:", err);
      return null;
    }
  },

  /**
   * List project activity logs.
   */
  async listByProject(projectId, { page = 1, perPage = 25 } = {}) {
    if (!projectId) {
      throw new ApiError("INVALID_INPUT", "projectId is required", 400);
    }

    page = Number(page) || 1;
    perPage = Number(perPage) || 25;
    const skip = (page - 1) * perPage;

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.activityLog.count({ where: { projectId } }),
    ]);

    return {
      items,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  },
};
