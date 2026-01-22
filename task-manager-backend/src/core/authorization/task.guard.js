import ApiError from "../errors/ApiError.js";

export async function assertTaskWorkspaceAccess(prisma, userId, taskId) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: { id: true, workspaceId: true },
      },
    },
  });

  if (!task) {
    throw new ApiError("TASK_NOT_FOUND", "Task not found", 404);
  }

  const member = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId: task.project.workspaceId,
    },
  });

  if (!member) {
    throw new ApiError("FORBIDDEN", "No access to this task", 403);
  }

  return task;
}
