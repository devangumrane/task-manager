// src/lib/socket.js
import { io } from "socket.io-client";

let socket = null;

export function initSocket(token) {
  if (!token) throw new Error("Socket token missing");

  socket = io(import.meta.env.VITE_API_URL, {
    transports: ["websocket"],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connect_error:", err?.message);
  });

  return socket;
}

export function getSocket() {
  if (!socket) throw new Error("Socket not initialized");
  return socket;
}

/**
 * Safe emit wrapper.
 * Ensures workspaceId presence for RBAC events.
 */
export function wsEmit(event, payload = {}) {
  if (!socket) throw new Error("Socket not initialized");

  // Allow join and leave freely
  if (event === "workspace.join" || event === "workspace.leave") {
    socket.emit(event, payload);
    return;
  }

  // All RBAC events require workspaceId
  const workspaceId =
    payload.workspaceId ||
    payload?.meta?.workspaceId ||
    payload?.task?.workspaceId ||
    payload?.project?.workspaceId;

  if (!workspaceId) {
    console.error(
      `Blocked client emit '${event}' — workspaceId missing.`,
      payload
    );
    return;
  }

  socket.emit(event, {
    ...payload,
    workspaceId, // enforce clean shape
    meta: { ...(payload.meta || {}), workspaceId },
  });
}

/**
 * Workspace room join
 */
export function joinWorkspace(workspaceId) {
  getSocket().emit("workspace.join", { workspaceId });
}

export function leaveWorkspace(workspaceId) {
  getSocket().emit("workspace.leave", { workspaceId });
}
