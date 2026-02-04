import { Project } from "../../models/index.js";
import { assertWorkspaceMember } from "./workspace.guard.js";
import ApiError from "../errors/ApiError.js";

export async function assertProjectAccess(userId, projectId) {
  // 1. Fetch project to get workspaceId
  const project = await Project.findByPk(projectId, {
    attributes: ['id', 'workspace_id']
  });

  if (!project) {
    throw new ApiError("PROJECT_NOT_FOUND", "Project not found", 404);
  }

  // 2. Check workspace membership
  await assertWorkspaceMember(null, userId, project.workspace_id);

  return project;
}