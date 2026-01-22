import ApiError from "../../core/errors/ApiError.js";

export function buildTaskUpdatePayload(data) {
  const allowed = {};

  if ("title" in data) {
    if (!data.title?.trim()) {
      throw new ApiError("INVALID_INPUT", "Title cannot be empty", 400);
    }
    allowed.title = data.title.trim();
  }

  if ("description" in data) allowed.description = data.description;
  if ("priority" in data) allowed.priority = data.priority;
  if ("status" in data) allowed.status = data.status;
  if ("dueDate" in data) {
    allowed.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }
  if ("assignedTo" in data) allowed.assignedTo = data.assignedTo;

  if (Object.keys(allowed).length === 0) {
    throw new ApiError("INVALID_INPUT", "No valid fields to update", 400);
  }

  return allowed;
}
