export async function assertProjectAccess(userId, projectId, prisma) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspace: {
        members: {
          some: { userId },
        },
      },
    },
    select: { id: true, workspaceId: true },
  });

  if (!project)
    throw new ApiError("FORBIDDEN", "No project access", 403);

  return project;
}