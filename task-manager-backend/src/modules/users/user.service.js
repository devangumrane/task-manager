import prisma from "../../core/database/prisma.js";
import { activityService } from "../activity/activity.service.js";
import fs from "fs";
import path from "path";
import { getEmitters } from "../../core/realtime/socket.js";
import ApiError from "../../core/errors/ApiError.js";

export const userService = {
  // GET /users/me  → private profile
  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError("USER_NOT_FOUND", "User not found", 404);
    }

    return user;
  },

  // PATCH /users/me  → update own profile
  // ONLY allow safe fields
  async updateMe(userId, data) {
    if (!data || Object.keys(data).length === 0) {
      throw new ApiError("INVALID_INPUT", "No data provided", 400);
    }

    // 🔒 Explicit allowlist (future-proof)
    const allowed = {};
    if ("name" in data) allowed.name = data.name;

    if (Object.keys(allowed).length === 0) {
      throw new ApiError("INVALID_INPUT", "No valid fields to update", 400);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: allowed,
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
      },
    });

    // Emit realtime update (best-effort)
    try {
      const emitters = getEmitters();
      emitters?.emitToUser(userId, "user.updated", {
        user: updated,
        meta: { byUserId: userId },
      });
    } catch (err) {
      console.error("emitters.emitToUser (user.updated) failed:", err);
    }

    // Activity log (best-effort)
    try {
      await activityService.log({
        workspaceId: null,
        userId,
        type: "user.profile_updated",
        metadata: {
          id: updated.id,
          fieldsUpdated: Object.keys(allowed),
        },
      });
    } catch (err) {
      console.error("activityService.log (user.profile_updated) failed:", err);
    }

    return updated;
  },

  // POST /users/me/avatar  → upload avatar
  async updateAvatar(userId, file) {
    if (!file) {
      throw new ApiError("INVALID_INPUT", "No file provided", 400);
    }

    const relativePath = `/uploads/avatars/${file.filename}`;

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true },
    });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: relativePath },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
      },
    });

    // Best-effort cleanup of old avatar
    try {
      if (
        existing?.profileImage &&
        existing.profileImage.startsWith("/uploads/")
      ) {
        const oldAbsPath = path.join(
          process.cwd(),
          existing.profileImage.replace(/^\//, "")
        );
        if (fs.existsSync(oldAbsPath)) {
          fs.unlinkSync(oldAbsPath);
        }
      }
    } catch (err) {
      console.error("avatar cleanup failed:", err);
    }

    // Emit realtime update
    try {
      const emitters = getEmitters();
      emitters?.emitToUser(userId, "user.updated", {
        user: updated,
        meta: { byUserId: userId },
      });
    } catch (err) {
      console.error("emitters.emitToUser (avatar) failed:", err);
    }

    // Activity log
    try {
      await activityService.log({
        workspaceId: null,
        userId,
        type: "user.avatar_uploaded",
        metadata: { avatarUrl: relativePath },
      });
    } catch (err) {
      console.error("activityService.log (user.avatar_uploaded) failed:", err);
    }

    return updated;
  },

  // GET /users/search?q=  → user discovery
  // NOTE: email exposure is intentional for internal search
  async search(query) {
    if (!query) return [];

    return prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
      },
      take: 20,
    });
  },

  // GET /users/:id  → public profile (NO email)
  async getUser(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        profileImage: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError("USER_NOT_FOUND", "User not found", 404);
    }

    return user;
  },
};
