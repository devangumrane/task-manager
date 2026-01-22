import ApiError from "../errors/ApiError.js";

export async function assertWorkspaceMember(prisma, userId, workspaceId) {
  const member = await prisma.workspaceMember.findFirst({
    where: { userId, workspaceId },
  });

  if (!member) {
    throw new ApiError("FORBIDDEN", "User has no access to this workspace", 403);
  }

  return member;
}
