import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socketService } from "../services/socket";
import { useAuthStore } from "../store/authStore";

export const useGlobalRealtime = () => {
    const queryClient = useQueryClient();
    const token = useAuthStore((s) => s.accessToken);
    const user = useAuthStore((s) => s.user);

    useEffect(() => {
        if (!token || !user) return;

        // 1. Ensure Global Connection
        // This makes sure we are connected and joined to 'user:${userId}' (handled by backend on connect)
        socketService.connect();

        // 2. Define Handler
        const handleDashboardUpdate = (payload) => {
            console.log("⚡ [Global Realtime] dashboard.update:", payload);

            // Invalidate Dashboard Stats
            queryClient.invalidateQueries(["dashboard-stats"]);

            // Also invalidate "My Tasks" if we have that query key
            // (Assumed key based on generic patterns, can be refined)
            queryClient.invalidateQueries(["my-tasks"]);
        };

        // 3. Subscribe
        socketService.on("dashboard.update", handleDashboardUpdate);

        // 4. Cleanup
        return () => {
            socketService.off("dashboard.update", handleDashboardUpdate);
            // We generally DON'T disconnect globally here because AppShell is persistent.
            // Disconnect happens on logout or window close usually.
        };
    }, [token, user, queryClient]);
};
