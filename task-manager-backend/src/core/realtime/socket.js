// src/core/realtime/socket.js
import { Server } from "socket.io";
import { socketAuthMiddleware } from "./socketAuth.js";
import { socketEventAuth } from "./socketEventAuth.js";
import { EVENTS } from "./events.js";
import prisma from "../database/prisma.js";

// --------------------------------------------------------
// Singleton reference for emitters
// --------------------------------------------------------
let _emitters = null;

export function getEmitters() {
  return _emitters;
}

// --------------------------------------------------------
// Create emitters (low-level helpers used by services)
// --------------------------------------------------------
function createEmitters(io) {
  return {
    emitToWorkspace(workspaceId, event, payload = {}) {
      if (!EVENTS[event]) {
        console.error(`Attempt to emit unknown event: ${event}`);
        return;
      }

      const room = `workspace:${workspaceId}`;
      io.to(room).emit(event, payload);
    },

    emitToUser(userId, event, payload = {}) {
      if (!EVENTS[event]) {
        console.error(`Attempt to emit unknown event: ${event}`);
        return;
      }

      io.to(`user:${userId}`).emit(event, payload);
    },
  };
}

// --------------------------------------------------------
// Export main initializer
// --------------------------------------------------------
export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*", // adjust for prod
    },
  });

  // ----------------------------------------
  // Global auth (JWT validation)
  // ----------------------------------------
  io.use(socketAuthMiddleware);

  // ----------------------------------------
  // Per-event RBAC & whitelist enforcement
  // ----------------------------------------
  io.on("connection", async (socket) => {
    console.log(`⚡ Socket connected: ${socket.user.id}`);

    // Allow all events to pass through RBAC checker
    socket.use(async (packet, next) => {
      try {
        await socketEventAuth(socket, packet, next);
      } catch (err) {
        console.error("socketEventAuth ERROR:", err);
        next(err);
      }
    });

    // --------------------------------------------------
    // JOIN WORKSPACE — client must explicitly join rooms
    // --------------------------------------------------
    socket.on("workspace.join", async ({ workspaceId }, ack) => {
      try {
        workspaceId = Number(workspaceId);
        if (!workspaceId) return ack?.({ error: "INVALID_WORKSPACE_ID" });

        // Resolve role for this user in this workspace
        const membership = await prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId: socket.user.id,
            },
          },
          select: { role: true },
        });

        if (!membership) {
          return ack?.({ error: "NOT_A_MEMBER" });
        }

        // Cache role on socket
        socket.roles.workspaces[workspaceId] = membership.role;

        // Join actual Socket.io room
        socket.join(`workspace:${workspaceId}`);

        console.log(`✅ User ${socket.user.id} joined workspace ${workspaceId}`);

        ack?.({ success: true, role: membership.role });
      } catch (err) {
        console.error("workspace.join failed:", err);
        ack?.({ error: "JOIN_FAILED" });
      }
    });

    // --------------------------------------------------
    // LEAVE WORKSPACE
    // --------------------------------------------------
    socket.on("workspace.leave", ({ workspaceId }) => {
      workspaceId = Number(workspaceId);
      socket.leave(`workspace:${workspaceId}`);
      delete socket.roles.workspaces[workspaceId];
    });

    // --------------------------------------------------
    // DISCONNECT
    // --------------------------------------------------
    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.user.id}`);
    });
  });

  // Save emitters for use by services
  _emitters = createEmitters(io);

  return io;
}
