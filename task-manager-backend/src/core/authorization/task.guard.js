import { Task, Project } from "../../models/index.js";
import { WorkspaceMember } from "../../models/index.js";
import ApiError from "../errors/ApiError.js";

export async function assertTaskWorkspaceAccess(tx, userId, taskId) {
  const options = {};
  if (tx) options.transaction = tx;

  const task = await Task.findByPk(taskId, {
    include: {
      model: Project,
      as: 'project',
      attributes: ['id', 'workspace_id'],
    },
    ...options
  });

  if (!task) {
    throw new ApiError("TASK_NOT_FOUND", "Task not found", 404);
  }

  if (!task.project) {
    // Should not happen if data integrity is good, but safely handle it
    throw new ApiError("INTERNAL", "Task has no associated project", 500);
  }

  const member = await WorkspaceMember.findOne({
    where: {
      user_id: userId,
      workspace_id: task.project.workspace_id,
    },
    ...options
  });

  if (!member) {
    throw new ApiError("FORBIDDEN", "No access to this task", 403);
  }

  return task;
}
