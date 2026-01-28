import ApiError from "../../core/errors/ApiError.js";

export async function createTaskCore(tx, payload) {
  return tx.task.create({
    data: {
      projectId: payload.projectId,
      createdBy: payload.createdBy,
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status ?? "todo",
      priority: payload.priority ? payload.priority : "MEDIUM",
      order: payload.order ?? 0,
      parentId: payload.parentId ?? null,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
      assignedTo: payload.assignedTo ?? null,
    },
  });
}
