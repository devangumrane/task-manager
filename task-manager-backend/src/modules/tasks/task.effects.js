import { activityService } from "../activity/activity.service.js";

import { notificationService } from "../notifications/notification.service.js"; // Import
import { getEmitters } from "../../core/realtime/socket.js";

export async function onTaskCreated(project, task, userId) {
  // Activity
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
    console.error("activityService.log (task.created) failed:", err);
  }

  // Realtime
  try {
    const emitters = getEmitters();
    emitters?.emitToWorkspace(project.workspace_id, "task.created", {
      task: {
        id: task.id,
        title: task.title,
        priority: task.priority,
        projectId: task.projectId,
      },
      meta: { byUserId: userId },
    });

    // 2.1 Emit to Dashboard (Specific Users)
    // Assignee
    if (task.assignedTo) {
      emitters?.emitToUser(task.assignedTo, "dashboard.update", { type: "task.assigned" });
    }
    // Creator (if different and not purely self-assigned)
    if (task.createdBy && task.createdBy !== task.assignedTo) {
      emitters?.emitToUser(task.createdBy, "dashboard.update", { type: "task.created" });
    }

  } catch (err) {
    console.error("emitters.emitToWorkspace (task.created) failed:", err);
  }
  // Notification
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
      console.error("notificationService.createNotificationRecord (task.created) failed:", err);
    }
  }
}

export async function onTaskDeleted(task, userId, workspaceId) {
  // Activity
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
    console.error("activityService.log (task.deleted) failed:", err);
  }

  // Realtime
  try {
    const emitters = getEmitters();
    emitters?.emitToWorkspace(workspaceId, "task.deleted", {
      taskId: task.id,
      projectId: task.projectId,
      meta: { byUserId: userId },
    });

    // Emit to user for dashboard update
    if (userId) {
      emitters?.emitToUser(userId, "dashboard.update", { type: "task.deleted" });
    }
    // Also try to emit to assignee if known? (task object might be minimal here)
    // The 'task' arg in onTaskDeleted usually has basic info.
    if (task.assignedTo) { // If implementation passes full task with assignedTo
      emitters?.emitToUser(task.assignedTo, "dashboard.update", { type: "task.deleted" });
    }

  } catch (err) {
    console.error("emitters.emitToWorkspace (task.deleted) failed:", err);
  }
}
