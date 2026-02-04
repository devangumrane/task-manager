// src/core/realtime/socket.js
import { Server } from "socket.io";
import { socketAuth } from "./socketAuth.js"; // Use the named export we defined
import { socketEventAuth } from "./socketEventAuth.js"; // Use our simplified version
import { EVENTS } from "./events.js"; // Assuming this file exists and is pure JS
import { WorkspaceMember } from "../../models/index.js";

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
      // Can add validation here
      const room = `workspace:${workspaceId}`;
      io.to(room).emit(event, payload);
    },

    emitToUser(userId, event, payload = {}) {
      io.to(`user:${userId}`).emit(event, payload);
    },

    // Allow access to io for custom uses
    io
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
  io.use(socketAuth); // Renamed from socketAuthMiddleware to match our export in socketAuth.js

  // ----------------------------------------
  // Per-event RBAC & whitelist enforcement
  // ----------------------------------------
  io.on("connection", async (socket) => {
    console.log(`⚡ Socket connected: ${socket.user?.id}`);

    // Join user room for direct messages/notifs
    if (socket.user && socket.user.id) {
      socket.join(`user:${socket.user.id}`);
    }

    // Allow all events to pass through RBAC checker
    socket.use(async (packet, next) => {
      try {
        await socketEventAuth(socket, next); // Correct signature
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
        const membership = await WorkspaceMember.findOne({
          where: {
            workspace_id: workspaceId,
            user_id: socket.user.id,
          },
          attributes: ['role']
        });

        if (!membership) {
          return ack?.({ error: "NOT_A_MEMBER" });
        }

        // Cache role on socket (ensure socket.roles init)
        if (!socket.roles) socket.roles = { workspaces: {} };
        if (!socket.roles.workspaces) socket.roles.workspaces = {};

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

    // Join Task Room
    socket.on("task.join", async ({ taskId }, ack) => {
      // Logic to check access to task (via workspace member) 
      // For now, simplify or assume workspace access check done
      const room = `task:${taskId}`;
      socket.join(room);
      ack?.({ success: true });
    });

    // --------------------------------------------------
    // LEAVE WORKSPACE
    // --------------------------------------------------
    socket.on("workspace.leave", ({ workspaceId }) => {
      workspaceId = Number(workspaceId);
      socket.leave(`workspace:${workspaceId}`);
      if (socket.roles?.workspaces) {
        delete socket.roles.workspaces[workspaceId];
      }
    });

    // --------------------------------------------------
    // DISCONNECT
    // --------------------------------------------------
    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.user?.id}`);
    });
  });

  // Save emitters for use by services
  _emitters = createEmitters(io);

  return io;
}
