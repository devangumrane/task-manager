import { Workspace, WorkspaceMember, User, Project } from "../../models/index.js";
import { activityService } from "../activity/activity.service.js";
import { getEmitters } from "../../core/realtime/socket.js";
import ApiError from "../../core/errors/ApiError.js";
import sequelize from "../../config/database.js";

export const workspaceService = {
  async createWorkspace(userId, data) {
    const name = data?.name?.trim();
    if (!name) {
      throw new ApiError("INVALID_INPUT", "Workspace name is required", 400);
    }

    const t = await sequelize.transaction();

    try {
      const workspace = await Workspace.create(
        {
          name,
          owner_id: userId,
        },
        { transaction: t }
      );

      // Add owner as admin member
      await WorkspaceMember.create(
        {
          workspace_id: workspace.id,
          user_id: userId,
          role: "admin",
        },
        { transaction: t }
      );

      await t.commit();

      // Fetch complete workspace with members
      const createdWorkspace = await Workspace.findByPk(workspace.id, {
        include: [
          {
            model: WorkspaceMember,
            as: "members",
            include: [{ model: User, as: "user" }],
          },
        ],
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

      return createdWorkspace;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async listUserWorkspaces(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Workspace,
          as: 'workspaces',
          include: [{ model: WorkspaceMember, as: 'members' }]
        }
      ]
    });

    return user ? user.workspaces : [];
  },

  async getWorkspace(workspaceId) {
    const ws = await Workspace.findByPk(workspaceId, {
      include: [
        {
          model: WorkspaceMember,
          as: "members",
          include: [{ model: User, as: "user" }],
        },
        { model: Project, as: "projects" },
      ],
    });

    if (!ws) {
      throw new ApiError("WORKSPACE_NOT_FOUND", "Workspace not found", 404);
    }

    return ws;
  },

  async addMember(workspaceId, data, actorId) {
    const user = await User.findOne({ where: { email: data.email } });

    if (!user) {
      throw new ApiError("USER_NOT_FOUND", "User with this email does not exist", 404);
    }

    // prevent duplicate membership
    const existing = await WorkspaceMember.findOne({
      where: {
        workspace_id: workspaceId,
        user_id: user.id
      },
    });

    if (existing) {
      throw new ApiError("ALREADY_MEMBER", "User is already a member of this workspace", 409);
    }

    const member = await WorkspaceMember.create({
      workspace_id: workspaceId,
      user_id: user.id,
      role: data.role,
    });

    // Fetch with user details for return
    const memberWithUser = await WorkspaceMember.findByPk(member.id, {
      include: [{ model: User, as: 'user' }]
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
          actorId,
        },
        meta: { byUserId: actorId },
      });
    } catch (err) {
      console.error("emitters.emitToWorkspace (workspace.member_added) failed:", err);
    }

    return memberWithUser;
  },

  async deleteWorkspace(workspaceId, userId) {
    // 1. Fetch workspace
    const workspace = await Workspace.findByPk(workspaceId);

    if (!workspace) {
      throw new ApiError("WORKSPACE_NOT_FOUND", "Workspace not found", 404);
    }

    // 2. Ownership Check (redundant if checking in controller/middleware, but safe)
    if (workspace.owner_id !== userId) {
      throw new ApiError(
        "FORBIDDEN",
        "Only the workspace owner can delete this workspace",
        403
      );
    }

    // 3. Delete
    // Cascade delete should handle related tables if configured in DB.
    // Otherwise, we might need manual cleanup of projects/tasks/members.
    // Assuming DB constraints or Sequelize hooks handle it.
    // Ideally:
    // User -> Workspaces (Client)
    // Workspace -> Projects -> Tasks
    // Workspace -> Members
    await Workspace.destroy({ where: { id: workspaceId } });

    // 4. Activity/Event
    try {
      await activityService.log({
        workspaceId, // Might be null in DB if row deleted, but useful for audit logs if preserved
        userId,
        type: "workspace.deleted",
        metadata: {
          id: workspaceId,
          name: workspace.name,
          actorId: userId,
        },
      });
    } catch (err) {
      console.error("activityService.log (workspace.deleted) failed:", err);
    }

    return true;
  },
};
