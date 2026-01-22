// src/core/realtime/socketAuth.js
import { verifyAccessToken } from "../utils/jwt.js";
import prisma from "../database/prisma.js";

/**
 * Socket authentication middleware.
 * - Verifies JWT from handshake.auth.token or Authorization header
 * - Attaches socket.user = { id, email, name }
 * - Initializes socket.roles.workspaces = {}
 */
export async function socketAuthMiddleware(socket, next) {
  try {
    // 1. Extract token from handshake
    const token =
      socket.handshake?.auth?.token ||
      (socket.handshake?.headers?.authorization || "").split(" ")[1];

    if (!token) {
      return next({
        code: "UNAUTHORIZED",
        message: "Unauthorized: token missing",
      });
    }

    // 2. Verify JWT
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      return next({
        code: "INVALID_TOKEN",
        message: "Unauthorized: invalid token",
      });
    }

    // 3. Fetch user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return next({
        code: "USER_NOT_FOUND",
        message: "Unauthorized: user not found",
      });
    }

    // 4. Attach minimal identity
    socket.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    // 5. Initialize RBAC cache
    socket.roles = {
      workspaces: Object.create(null), // { [workspaceId]: "member" | "admin" }
    };

    return next();
  } catch (err) {
    return next({
      code: "SOCKET_AUTH_ERROR",
      message: err.message || "Socket authentication failed",
    });
  }
}
