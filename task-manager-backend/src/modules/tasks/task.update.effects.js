import { activityService } from "../activity/activity.service.js";
import { getEmitters } from "../../core/realtime/socket.js";

export async function onTaskUpdated(task, changes, userId, workspaceId) {
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
    console.error("activityService.log (task.updated) failed:", err);
  }

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
    console.error("emitters.emitToWorkspace (task.updated) failed:", err);
  }
}
