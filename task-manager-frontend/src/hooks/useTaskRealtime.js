// src/hooks/useTaskRealtime.js
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socketService } from "../services/socket";

export const useTaskRealtime = (workspaceId, projectId, taskId = null) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!workspaceId) return;

        // 1. Connect & Join
        socketService.connect();
        socketService.joinWorkspace(workspaceId)
            .then(() => console.log(`Joined workspace ${workspaceId}`))
            .catch((err) => console.error("Failed to join workspace socket:", err));

        // 2. Define Handlers
        const handleTaskCreated = (payload) => {
            // payload: { task: { ... }, meta: { byUserId } }
            if (payload.task.projectId !== Number(projectId)) return;

            console.log("Socket: task.created", payload);
            queryClient.invalidateQueries(["projectTasks", workspaceId, projectId]);
        };

        const handleTaskUpdated = (payload) => {
            // payload: { task: { id, changes }, meta: { byUserId } }
            console.log("Socket: task.updated", payload);

            // Update List Cache (Optimistic-ish)
            queryClient.setQueryData(["projectTasks", workspaceId, projectId], (old = []) => {
                return old.map(t => t.id === payload.task.id ? { ...t, ...payload.task.changes } : t);
            });
            // Invalidate to be sure
            queryClient.invalidateQueries(["projectTasks", workspaceId, projectId]);
            queryClient.invalidateQueries(["task", workspaceId, projectId, payload.task.id]);
        };

        const handleTaskDeleted = (payload) => {
            // payload: { taskId, projectId, meta }
            if (payload.projectId !== Number(projectId)) return;

            console.log("Socket: task.deleted", payload);
            queryClient.setQueryData(["projectTasks", workspaceId, projectId], (old = []) => {
                return old.filter(t => t.id !== payload.taskId);
            });
            queryClient.invalidateQueries(["projectTasks", workspaceId, projectId]);
        };

        const handleReminderCreated = (payload) => {
            // payload: { reminder: { id, taskId, ... }, meta: { byUserId } }
            console.log("Socket: reminder.created", payload);
            // Invalidate reminders for the specific task that was affected
            queryClient.invalidateQueries(["taskReminders", workspaceId, projectId, String(payload.reminder.taskId)]);
        };

        const handleReminderDeleted = (payload) => {
            // payload: { reminder: { id, taskId }, meta: { byUserId } }
            console.log("Socket: reminder.deleted", payload);
            queryClient.invalidateQueries(["taskReminders", workspaceId, projectId, String(payload.reminder.taskId)]);
        };

        const handleAttachmentUploaded = (payload) => {
            // payload: { attachment: { id, taskId }, meta: { byUserId } }
            console.log("Socket: attachment.uploaded", payload);
            queryClient.invalidateQueries(["taskAttachments", workspaceId, projectId, String(payload.attachment.taskId)]);
        };

        const handleAttachmentDeleted = (payload) => {
            console.log("Socket: attachment.deleted", payload);
            queryClient.invalidateQueries(["taskAttachments", workspaceId, projectId, String(payload.attachment.taskId)]);
        };

        // 3. Subscribe
        socketService.on("task.created", handleTaskCreated);
        socketService.on("task.updated", handleTaskUpdated);
        socketService.on("task.deleted", handleTaskDeleted);
        socketService.on("reminder.created", handleReminderCreated);
        socketService.on("reminder.deleted", handleReminderDeleted);
        socketService.on("attachment.uploaded", handleAttachmentUploaded);
        socketService.on("attachment.deleted", handleAttachmentDeleted);

        // 4. Cleanup
        return () => {
            socketService.off("task.created", handleTaskCreated);
            socketService.off("task.updated", handleTaskUpdated);
            socketService.off("task.deleted", handleTaskDeleted);
            socketService.off("reminder.created", handleReminderCreated);
            socketService.off("reminder.deleted", handleReminderDeleted);
            socketService.off("attachment.uploaded", handleAttachmentUploaded);
            socketService.off("attachment.deleted", handleAttachmentDeleted);
            socketService.leaveWorkspace(workspaceId);
        };
    }, [workspaceId, projectId, taskId, queryClient]); // Depend on taskId even if not strictly used in filters yet, for consistency
};

