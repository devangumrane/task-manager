import { Project, Task, User, Workspace } from "../../models/index.js";
import { activityService } from "../activity/activity.service.js";
import { getEmitters } from "../../core/realtime/socket.js";
import ApiError from "../../core/errors/ApiError.js";
import sequelize from "../../config/database.js";

export const projectService = {
  async createProject(workspaceId, userId, data) {
    const name = data?.name?.trim();
    if (!name) throw new ApiError("INVALID_INPUT", "Project name is required", 400);

    const project = await sequelize.transaction(async (t) => {
      try {
        return await Project.create({
          workspace_id: workspaceId,
          name,
          description: data.description || null,
          owner_id: userId,
        }, { transaction: t });
      } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
          throw new ApiError("CONFLICT", "Project with same unique field exists", 409, { meta: err.fields });
        }
        throw err;
      }
    });

    // -------------------------
    // Activity log (Best Effort)
    // -------------------------
    try {
      await activityService.log({
        workspaceId,
        userId,
        projectId: project.id,
        type: "project.created",
        metadata: {
          id: project.id,
          name: project.name,
        },
      });
    } catch (err) {
      console.error("activityService.log (project.created) failed:", err);
    }

    // -------------------------
    // Emit realtime
    // -------------------------
    try {
      const emitters = getEmitters();
      emitters?.emitToWorkspace(workspaceId, "project.created", {
        project: {
          id: project.id,
          name: project.name,
        },
        meta: { byUserId: userId },
      });
    } catch (err) {
      console.error("emitters.emitToWorkspace (project.created) failed:", err);
    }

    return project;
  },

  async listWorkspaceProjects(workspaceId) {
    return Project.findAll({
      where: { workspace_id: workspaceId },
      include: [
        { model: Task, as: 'tasks' },
        { model: User, as: 'owner', attributes: ['id', 'username', 'email', 'profile_image'] }
      ],
      order: [["createdAt", "DESC"]],
    });
  },

  // ------------------------------------------------------
  // Safe implementation using standard Sequelize methods
  // ------------------------------------------------------
  async listAllUserProjects(userId) {
    // 1. Get user's workspace memberships
    // We can use the User model to fetch associated workspaces
    const user = await User.findByPk(userId, {
      include: [{
        model: Workspace,
        as: 'workspaces',
        attributes: ['id'],
        through: { attributes: [] } // avoid fetching join table data unnecessarily
      }]
    });

    if (!user) return [];

    const workspaceIds = user.workspaces.map(ws => ws.id);

    if (workspaceIds.length === 0) return [];

    // 2. Fetch projects in these workspaces
    return Project.findAll({
      where: {
        workspace_id: {
          [sequelize.Sequelize.Op.in]: workspaceIds
        }
      },
      include: [
        { model: Task, as: 'tasks' },
        { model: User, as: 'owner', attributes: ['id', 'username', 'email', 'profile_image'] }
      ],
      order: [["createdAt", "DESC"]],
    });
  },

  async getProject(projectId) {
    const project = await Project.findByPk(projectId, {
      include: [{ model: Task, as: 'tasks' }],
    });

    if (!project) throw new ApiError("PROJECT_NOT_FOUND", "Project not found", 404);
    return project;
  },

  async deleteProject(projectId, userId) {
    const project = await Project.findByPk(projectId);

    if (!project) throw new ApiError("PROJECT_NOT_FOUND", "Project not found", 404);

    // Authorization: Project Owner OR Workspace Admin
    let isAuthorized = false;

    if (project.owner_id === userId) {
      isAuthorized = true;
    } else {
      // Check if user is workspace admin
      const member = await WorkspaceMember.findOne({
        where: {
          workspace_id: project.workspace_id,
          user_id: userId
        }
      });

      if (member && member.role === 'admin') {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new ApiError("FORBIDDEN", "Only the project owner or workspace admin can delete this project", 403);
    }

    await Project.destroy({ where: { id: projectId } });

    // Activity log
    try {
      await activityService.log({
        workspaceId: project.workspace_id,
        userId,
        type: "project.deleted",
        metadata: {
          id: projectId,
          name: project.name,
          actorId: userId,
        },
      });
    } catch (err) {
      console.error("activityService.log (project.deleted) failed:", err);
    }

    return true;
  },
};
