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

    // --------------------------------------------------
    // TASK PRESENCE & TYPING
    // --------------------------------------------------
    const broadcastPresence = async (taskId) => {
      const room = `task:${taskId}`;
      const sockets = await io.in(room).fetchSockets();
      const users = sockets.map(s => ({
        id: s.user.id,
        name: s.user.first_name || 'User', // basic fallback
        // avatar: s.user.avatar 
      }));
      // Remove duplicates if same user has multiple tabs
      const uniqueUsers = [];
      const seen = new Set();
      for (const u of users) {
        if (!seen.has(u.id)) {
          seen.add(u.id);
          uniqueUsers.push(u);
        }
      }

      io.to(room).emit('task.presence', { users: uniqueUsers });
    };

    socket.on("task.view", async ({ taskId }, ack) => {
      const room = `task:${taskId}`;
      socket.join(room);
      await broadcastPresence(taskId);
      ack?.({ success: true });
    });

    socket.on("task.leave", async ({ taskId }) => {
      const room = `task:${taskId}`;
      socket.leave(room);
      await broadcastPresence(taskId);
    });

    socket.on("task.typing", ({ taskId, isTyping }) => {
      // Broadcast to everyone ELSE in the room
      socket.to(`task:${taskId}`).emit("task.typing", {
        userId: socket.user.id,
        isTyping
      });
    });

    // Handle disconnect for presence update
    socket.on("disconnecting", () => {
      // "disconnecting" event allows access to rooms BEFORE leaving
      for (const room of socket.rooms) {
        if (room.startsWith("task:")) {
          const taskId = room.split(":")[1];
          // We need to wait a tick for the socket to actually leave?
          // Or just broadcast. Since this listener runs BEFORE leave, 
          // the list still includes this socket. 
          // We should filter it out manually or run broadcast after a small delay?
          // Actually, standard pattern is to let it disconnect, then logic update?
          // But after disconnect, we can't emit from this socket.
          // We can use a global emitter?
          // Let's rely on the client explicitly sending 'task.leave' usually, 
          // but for strictness, we can trigger update.
          // Simple hack: Set timeout to broadcast after disconnect
          setTimeout(() => broadcastPresence(taskId), 1000);
        }
      }
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
