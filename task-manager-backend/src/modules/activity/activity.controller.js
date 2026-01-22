// src/modules/activity/activity.controller.js

import asyncHandler from "../../core/middlewares/asyncHandler.js";
import ApiError from "../../core/errors/ApiError.js";
import { listActivitySchema } from "./activity.schemas.js";
import { activityService } from "./activity.service.js";

export const activityController = {
  // ------------------------------------------------------
  // GET Workspace Activity Logs
  // GET /api/v1/workspaces/:workspaceId/activity?page=1&perPage=25
  // ------------------------------------------------------
  listWorkspace: asyncHandler(async (req, res) => {
    const parsed = listActivitySchema.parse({
      workspaceId: req.params.workspaceId,
      page: req.query.page,
      perPage: req.query.perPage,
    });

    const workspaceId = Number(parsed.workspaceId);
    if (!workspaceId) {
      throw new ApiError("INVALID_WORKSPACE_ID", "Invalid workspace ID", 400);
    }

    const result = await activityService.listByWorkspace(workspaceId, {
      page: parsed.page,
      perPage: parsed.perPage,
    });

    res.json({
      success: true,
      data: result.items,
      meta: result.meta,
    });
  }),
};