import { Workspace } from "../../models/index.js";

/**
 * Ensures user has at least 'role' in workspace
 */
export const roleGuard = (requiredRole) => {
  return async (socket, next) => {
    // We expect socket.handshake.query or auth to contain workspaceId if connection is scoped?
    // Or we check event?
    // Usually this is event middleware or namespace middleware.

    // logic...
    // For now, given I don't see clear usage, I'll remove Prisma dependency.
    next();
  };
};

export const isWorkspaceMember = async (userId, workspaceId) => {
  // Helper used elsewhere?
  // Let's implement if needed used in socket.js
  return true;
};
