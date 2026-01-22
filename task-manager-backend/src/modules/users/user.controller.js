// src/modules/users/user.controller.js

import asyncHandler from "../../core/middlewares/asyncHandler.js";
import ApiError from "../../core/errors/ApiError.js";

import {
  updateMeSchema,
  searchUsersSchema,
  idParamSchema,
} from "./user.schemas.js";

import { userService } from "./user.service.js";
import { activityService } from "../activity/activity.service.js";
import { getEmitters } from "../../core/realtime/socket.js";

export const userController = {
  // ------------------------------------------------------
  // GET /me
  // ------------------------------------------------------
  getMe: asyncHandler(async (req, res) => {
    const user = await userService.getMe(req.user.id);
    res.json({ success: true, data: user });
  }),

  // ------------------------------------------------------
  // UPDATE /me
  // ------------------------------------------------------
  updateMe: asyncHandler(async (req, res) => {
    const parsed = updateMeSchema.parse(req.body);

    const updated = await userService.updateMe(req.user.id, parsed);

    // Activity log
    await activityService.log({
      workspaceId: null,
      userId: req.user.id,
      type: "user.profile_updated",
      metadata: {
        actorId: req.user.id,
        fieldsUpdated: Object.keys(parsed),
      },
    });

    // Emit event to user channel
    const emitters = getEmitters();
    emitters?.emitToUser(req.user.id, "user.updated", {
      user: updated,
      meta: { byUserId: req.user.id },
    });

    res.json({ success: true, data: updated });
  }),

  // ------------------------------------------------------
  // Search Users
  // ------------------------------------------------------
  search: asyncHandler(async (req, res) => {
    const parsed = searchUsersSchema.parse({ q: req.query.q });

    const items = await userService.search(parsed.q);
    res.json({ success: true, data: items });
  }),

  // ------------------------------------------------------
  // GET Single User
  // ------------------------------------------------------
  getUser: asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);

    const user = await userService.getUser(id);
    if (!user) {
      throw new ApiError("USER_NOT_FOUND", "User not found", 404);
    }

    res.json({ success: true, data: user });
  }),

  // ------------------------------------------------------
  // Upload Avatar
  // ------------------------------------------------------
  uploadAvatar: asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError("NO_FILE_UPLOADED", "No file uploaded", 400);
    }

    const result = await userService.updateAvatar(req.user.id, req.file);

    res.json({
      success: true,
      data: { avatarUrl: result.profileImage },
    });
  }),
};
