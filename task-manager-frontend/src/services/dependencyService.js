import api from "../api/axios";

// Add a dependency (Task A blocks Task B)
// The route says "addDependency" on specific task.
// Logic: "This task depends on X". So X is the blocker.
// Endpoint: POST /tasks/:taskId/dependencies { blockerId }
export const addDependency = async (workspaceId, projectId, taskId, blockerId) => {
    const res = await api.post(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/dependencies`,
        { blockerId }
    );
    return res.data;
};

// Remove a dependency
// Endpoint: DELETE /tasks/:taskId/dependencies/:blockerId
export const removeDependency = async (workspaceId, projectId, taskId, blockerId) => {
    const res = await api.delete(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/dependencies/${blockerId}`
    );
    return res.data;
};
