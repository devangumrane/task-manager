import { eventBus, EVENTS } from "../../core/events/eventBus.js";
import { activityService } from "../activity/activity.service.js";
import { notificationService } from "../notifications/notification.service.js";
import { getEmitters } from "../../core/realtime/socket.js";

// --------------------------------------------------------------------------
// TASK CREATED
// --------------------------------------------------------------------------
async function handleTaskCreated({ project, task, userId }) {
    console.log(`[Event] TASK.CREATED received for Task ID: ${task.id}`);

    // 1. Activity Log
    try {
        await activityService.log({
            workspaceId: project.workspace_id,
            userId,
            taskId: task.id,
            projectId: project.id,
            type: "task.created",
            metadata: {
                id: task.id,
                title: task.title,
                priority: task.priority,
            },
        });
    } catch (err) {
        console.error("[Listener] activityService.log (task.created) failed:", err);
    }

    // 2. Realtime Updates
    try {
        const emitters = getEmitters();
        // Emit to Workspace
        emitters?.emitToWorkspace(project.workspace_id, "task.created", {
            task: {
                id: task.id,
                title: task.title,
                priority: task.priority,
                projectId: task.projectId,
            },
            meta: { byUserId: userId },
        });

        // Emit to Dashboard (Specific Users)
        if (task.assignedTo) {
            emitters?.emitToUser(task.assignedTo, "dashboard.update", { type: "task.assigned" });
        }
        if (task.createdBy && task.createdBy !== task.assignedTo) {
            emitters?.emitToUser(task.createdBy, "dashboard.update", { type: "task.created" });
        }
    } catch (err) {
        console.error("[Listener] Realtime emit (task.created) failed:", err);
    }

    // 3. Notifications
    if (task.assignedTo && task.assignedTo !== userId) {
        try {
            await notificationService.createNotificationRecord({
                userId: task.assignedTo,
                type: "task_assigned",
                title: "New Task Assigned",
                body: `You have been assigned to task: ${task.title}`,
                data: { taskId: task.id, projectId: project.id, workspaceId: project.workspace_id }
            });
        } catch (err) {
            console.error("[Listener] notificationService (task.created) failed:", err);
        }
    }
}

// --------------------------------------------------------------------------
// TASK UPDATED
// --------------------------------------------------------------------------
async function handleTaskUpdated({ task, changes, userId, workspaceId }) {
    console.log(`[Event] TASK.UPDATED received for Task ID: ${task.id}`);

    // 1. Activity Log
    try {
        await activityService.log({
            workspaceId,
            userId,
            taskId: task.id,
            projectId: task.projectId,
            type: "task.updated",
            metadata: {
                id: task.id,
                changes,
            },
        });
    } catch (err) {
        console.error("[Listener] activityService.log (task.updated) failed:", err);
    }

    // 2. Realtime Updates
    try {
        const emitters = getEmitters();
        emitters?.emitToWorkspace(workspaceId, "task.updated", {
            task: {
                id: task.id,
                changes,
            },
            meta: { byUserId: userId },
        });

        // Emit to dashboard users
        if (task.assignedTo) {
            emitters?.emitToUser(task.assignedTo, "dashboard.update", { type: "task.updated" });
        }
        if (userId && userId !== task.assignedTo) {
            emitters?.emitToUser(userId, "dashboard.update", { type: "task.updated" });
        }
    } catch (err) {
        console.error("[Listener] Realtime emit (task.updated) failed:", err);
    }
}

// --------------------------------------------------------------------------
// TASK DELETED
// --------------------------------------------------------------------------
async function handleTaskDeleted({ task, userId, workspaceId }) {
    console.log(`[Event] TASK.DELETED received for Task ID: ${task.id}`);

    // 1. Activity Log
    try {
        await activityService.log({
            workspaceId,
            userId,
            taskId: task.id,
            projectId: task.projectId,
            type: "task.deleted",
            metadata: {
                id: task.id,
                title: task.title,
            },
        });
    } catch (err) {
        console.error("[Listener] activityService.log (task.deleted) failed:", err);
    }

    // 2. Realtime Updates
    try {
        const emitters = getEmitters();
        emitters?.emitToWorkspace(workspaceId, "task.deleted", {
            taskId: task.id,
            projectId: task.projectId,
            meta: { byUserId: userId },
        });

        // Emit to dashboard users
        if (userId) {
            emitters?.emitToUser(userId, "dashboard.update", { type: "task.deleted" });
        }
        if (task.assignedTo) {
            emitters?.emitToUser(task.assignedTo, "dashboard.update", { type: "task.deleted" });
        }
    } catch (err) {
        console.error("[Listener] Realtime emit (task.deleted) failed:", err);
    }
}

// --------------------------------------------------------------------------
// REGISTRATION
// --------------------------------------------------------------------------
export function registerTaskListeners() {
    eventBus.on(EVENTS.TASK.CREATED, handleTaskCreated);
    eventBus.on(EVENTS.TASK.UPDATED, handleTaskUpdated);
    eventBus.on(EVENTS.TASK.DELETED, handleTaskDeleted);
}
