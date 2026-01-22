// src/hooks/useWorkspaceSocket.js
import { useEffect } from "react";
import { joinWorkspace, leaveWorkspace, getSocket } from "../lib/socket";

export function useWorkspaceSocket(workspaceId, handlers = {}) {
  useEffect(() => {
    if (!workspaceId) return;

    const socket = getSocket();

    joinWorkspace(workspaceId);

    // bind handlers
    for (const [event, fn] of Object.entries(handlers)) {
      socket.on(event, fn);
    }

    return () => {
      for (const [event, fn] of Object.entries(handlers)) {
        socket.off(event, fn);
      }
      leaveWorkspace(workspaceId);
    };
  }, [workspaceId]);
}
