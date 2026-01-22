import prisma from "../../core/database/prisma.js";
import { activityService } from "../activity/activity.service.js";
import { getEmitters } from "../../core/realtime/socket.js";
import ApiError from "../../core/errors/ApiError.js";

export const workspaceService = {
  async createWorkspace(userId, data) {
    const name = data?.name?.trim();
    if (!name) {
      throw new ApiError("INVALID_INPUT", "Workspace name is required", 400);
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        ownerId: userId,
        members: { create: { userId, role: "admin" } },
      },
      include: { members: { include: { user: true } } },
    });

    // -------------------------
    // Activity log
    // -------------------------
    try {
      await activityService.log({
        workspaceId: workspace.id,
        userId,
        type: "workspace.created",
        metadata: {
          id: workspace.id,
          name: workspace.name,
          actorId: userId,
        },
      });
    } catch (err) {
      console.error("activityService.log (workspace.created) failed:", err);
    }

    // -------------------------
    // Emit realtime
    // -------------------------
    try {
      const emitters = getEmitters();
      emitters?.emitToWorkspace(workspace.id, "workspace.created", {
        workspace: {
          id: workspace.id,
          name: workspace.name,
        },
        meta: { byUserId: userId },
      });
    } catch (err) {
      console.error("emitters.emitToWorkspace (workspace.created) failed:", err);
    }

    return workspace;
  },

  async listUserWorkspaces(userId) {
    return prisma.workspace.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: { members: true },
      orderBy: { updatedAt: "desc" },
    });
  },

  async getWorkspace(workspaceId) {
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: { include: { user: true } },
        projects: true,
      },
    });

    if (!ws) {
      throw new ApiError("WORKSPACE_NOT_FOUND", "Workspace not found", 404);
    }

    return ws;
  },

  async addMember(workspaceId, data, actorId) {
    // New param: actorId (admin performing the action)

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new ApiError("USER_NOT_FOUND", "User with this email does not exist", 404);
    }

    // prevent duplicate membership
    const existing = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: user.id },
      },
    });

    if (existing) {
      throw new ApiError("ALREADY_MEMBER", "User is already a member of this workspace", 409);
    }

    const member = await prisma.workspaceMember.create({
      data: { workspaceId, userId: user.id, role: data.role },
      include: { user: true },
    });

    // -------------------------
    // Activity log
    // -------------------------
    try {
      await activityService.log({
        workspaceId,
        userId: actorId, // actor performing the action
        type: "workspace.member_added",
        metadata: {
          id: user.id,
          email: user.email,
          role: data.role,
          actorId,
        },
      });
    } catch (err) {
      console.error("activityService.log (workspace.member_added) failed:", err);
    }

    // -------------------------
    // Emit realtime
    // -------------------------
    try {
      const emitters = getEmitters();
      emitters?.emitToWorkspace(workspaceId, "workspace.member_added", {
        member: {
          id: user.id,
          email: user.email,
          role: data.role,
        },
        meta: { byUserId: actorId },
      });
    } catch (err) {
      console.error("emitters.emitToWorkspace (workspace.member_added) failed:", err);
    }

    return member;
  },
};
