import ApiError from "../../core/errors/ApiError.js";

export async function createTaskCore(tx, payload) {
  return tx.task.create({
    data: {
      title: payload.title,
      description: payload.description ?? null,
      projectId: payload.projectId,
      createdBy: payload.createdBy,
      status: payload.status,
      priority: payload.priority
        ? payload.priority.toLowerCase()
        : "medium",
      dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
      assignedTo: payload.assignedTo ?? null,
    },
  });
}
