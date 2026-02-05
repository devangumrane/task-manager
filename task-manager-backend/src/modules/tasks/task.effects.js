import { activityService } from "../activity/activity.service.js";
import { getEmitters } from "../../core/realtime/socket.js";

export async function onTaskCreated(project, task, userId) {
  // Activity
  try {
    await activityService.log({
      workspaceId: project.workspaceId,
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
    emitters?.emitToWorkspace(project.workspaceId, "task.created", {
      task: {
        id: task.id,
        title: task.title,
        priority: task.priority,
        projectId: task.projectId,
      },
      meta: { byUserId: userId },
    });
  } catch (err) {
    console.error("emitters.emitToWorkspace (task.created) failed:", err);
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
  } catch (err) {
    console.error("emitters.emitToWorkspace (task.deleted) failed:", err);
  }
}
