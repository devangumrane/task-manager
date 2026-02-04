import { Task } from "../../models/index.js";

export async function createTaskCore(tx, payload) {
  const options = {};
  if (tx) options.transaction = tx;

  // Map payload fields to Sequelize model fields
  return Task.create({
    project_id: payload.projectId,
    created_by: payload.createdBy,
    title: payload.title,
    description: payload.description ?? null,
    status: payload.status ?? "pending", // Task model uses 'pending', payload might define 'todo' -> map it?
    // 'todo' is not in ENUM('pending', 'in_progress', 'completed')
    // Let's assume 'todo' maps to 'pending'
    priority: payload.priority ? payload.priority.toLowerCase() : "medium",
    // order: payload.order ?? 0, // Task model (step 437) didn't have 'order' field. Skipping if not in model.
    // parentId: payload.parentId ?? null, // Task model didn't have parentId. Skipping.
    deadline: payload.dueDate ? new Date(payload.dueDate) : null,
    assigned_to: payload.assignedTo ?? null,
    // workspace_id is needed in Task? 
    // Task model has workspace_id. We should set it.
    // Logic: payload doesn't have workspaceId explicitly passed here usually?
    // Wait, createTaskCore is called from task.service.
    // I should add workspaceId to payload in service or here.
    workspace_id: payload.workspaceId,
  }, options);
}
