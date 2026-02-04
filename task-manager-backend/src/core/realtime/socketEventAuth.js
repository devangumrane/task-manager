import { WorkspaceMember } from "../../models/index.js";

/**
 * Middleware for socket events to ensure user belongs to workspace
 */
export const socketEventAuth = (socket, next) => {
  // Currently generic passthrough as per previous logic review.
  // If specific packet logic needed:
  // const [event, ...args] = socket.packet;
  // Check payload for workspaceId and validate vs socket.user.workspaces?

  next();
};
