// src/core/realtime/roleGuard.js
import prisma from "../database/prisma.js";
import ApiError from "../errors/ApiError.js";

const ROLE_ORDER = ["member", "admin"];
const roleIndex = (r) => ROLE_ORDER.indexOf(r);

export async function requireSocketRole(socket, workspaceId, requiredRole = "member") {
  if (!socket?.user) {
    throw new ApiError("UNAUTHORIZED", "Socket unauthenticated", 401);
  }

  const uid = socket.user.id;

  // Cached role
  const cached = socket.roleInWorkspace?.[workspaceId];
  if (cached) {
    if (roleIndex(cached) >= roleIndex(requiredRole)) return cached;
    throw new ApiError("FORBIDDEN", "Insufficient role", 403);
  }

  // Workspace exists?
  const workspace = await prisma.workspace.findUnique({
    where: { id: Number(workspaceId) },
    select: { ownerId: true },
  });

  if (!workspace) {
    throw new ApiError("WORKSPACE_NOT_FOUND", "Workspace not found", 404);
  }

  // Owner → always admin
  if (workspace.ownerId === uid) {
    socket.roleInWorkspace[workspaceId] = "admin";
    return "admin";
  }

  // Member lookup
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: Number(workspaceId),
        userId: uid,
      },
    },
    select: { role: true },
  });

  if (!member) {
    throw new ApiError("ACCESS_DENIED", "Not a workspace member", 403);
  }

  socket.roleInWorkspace[workspaceId] = member.role;

  if (roleIndex(member.role) >= roleIndex(requiredRole)) return member.role;

  throw new ApiError("FORBIDDEN", "Insufficient role", 403);
}
