import prisma from "../../core/database/prisma.js";
import { activityService } from "../activity/activity.service.js";
import { getEmitters } from "../../core/realtime/socket.js";
import ApiError from "../../core/errors/ApiError.js";

export const projectService = {
  async createProject(userId, data) {
    const name = data?.name?.trim();
    if (!name) throw new ApiError("INVALID_INPUT", "Project name is required", 400);

    const project = await prisma.$transaction(async (tx) => {
      // 1. Create Project
      const newProject = await tx.project.create({
        data: {
          name,
          description: data.description || null,
        },
      });

      // 2. Add Creator as Owner
      await tx.projectMember.create({
        data: {
          projectId: newProject.id,
          userId,
          role: "OWNER",
        },
      });

      return newProject;
    });

    // -------------------------
    // Activity log
    // -------------------------
    try {
      await activityService.log({
        projectId: project.id,
        userId,
        type: "project.created",
        metadata: {
          id: project.id,
          name: project.name,
        },
      });
    } catch (err) {
      console.error("activityService.log failed:", err);
    }

    return project;
  },

  async listUserProjects(userId) {
    // Return projects where the user is a member
    const members = await prisma.projectMember.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            _count: { select: { tasks: true } }
          }
        }
      },
      orderBy: { project: { createdAt: "desc" } },
    });

    return members.map((m) => m.project);
  },

  async getProject(projectId, userId) {
    // Ensure user has access
    const member = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!member) throw new ApiError("FORBIDDEN", "You do not have access to this project", 403);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: true,
        members: { include: { user: true } },
      },
    });

    if (!project) throw new ApiError("PROJECT_NOT_FOUND", "Project not found", 404);
    return project;
  },
};
