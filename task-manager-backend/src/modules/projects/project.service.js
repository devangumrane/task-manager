import prisma from "../../core/database/prisma.js";
import { activityService } from "../activity/activity.service.js";
import { getEmitters } from "../../core/realtime/socket.js";
import ApiError from "../../core/errors/ApiError.js";

export const projectService = {
  async createProject(workspaceId, userId, data) {
    const name = data?.name?.trim();
    if (!name) throw new ApiError("INVALID_INPUT", "Project name is required", 400);

    let project;
    try {
      project = await prisma.project.create({
        data: {
          workspaceId,
          name,
          description: data.description || null,
          createdBy: userId,
        },
      });
    } catch (err) {
      if (err?.code === "P2002") {
        throw new ApiError("CONFLICT", "Project with same unique field exists", 409, { meta: err.meta });
      }
      throw err;
    }

    // -------------------------
    // Activity log
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
    return prisma.project.findMany({
      where: { workspaceId },
      include: { tasks: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getProject(projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: true },
    });

    if (!project) throw new ApiError("PROJECT_NOT_FOUND", "Project not found", 404);
    return project;
  },
};
