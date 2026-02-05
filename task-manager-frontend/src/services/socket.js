// src/services/socket.js
import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

class SocketService {
    socket = null;

    connect() {
        if (this.socket?.connected) return;

        const token = localStorage.getItem("token"); // or from store
        if (!token) return;

        this.socket = io(API_URL, {
            auth: { token },
            transports: ["websocket"],
            reconnection: true,
        });

        this.socket.on("connect", () => {
            console.log("⚡ [Socket] Connected:", this.socket.id);
        });

        this.socket.on("disconnect", (reason) => {
            console.log("🔌 [Socket] Disconnected:", reason);
        });

        this.socket.on("connect_error", (err) => {
            console.error("❌ [Socket] Connection Error:", err.message);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Join a workspace room (must be member)
    joinWorkspace(workspaceId) {
        if (!this.socket) return Promise.reject("Socket not connected");
        return new Promise((resolve, reject) => {
            this.socket.emit("workspace.join", { workspaceId }, (res) => {
                if (res?.error) reject(res.error);
                else resolve(res);
            });
        });
    }

    leaveWorkspace(workspaceId) {
        if (!this.socket) return;
        this.socket.emit("workspace.leave", { workspaceId });
    }

    on(event, callback) {
        this.socket?.on(event, callback);
    }

    off(event, callback) {
        this.socket?.off(event, callback);
    }
}

export const socketService = new SocketService();
