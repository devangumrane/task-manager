import api from "../api/axios";

// List all tags in the workspace (via task context or generally)
// The backend route was mounted on task routes but exposes workspace level tags
// GET /workspaces/:wid/projects/:pid/tasks/tags/all
// We need to construct the URL based on where it is mounted.
// In task.routes.js: router.get("/tags/all", ...)
// Mounted at: /workspaces/:workspaceId/projects/:projectId/tasks
// So full URL: /workspaces/:workspaceId/projects/:projectId/tasks/tags/all

export const getWorkspaceTags = async (workspaceId, projectId) => {
    const res = await api.get(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/tags/all`
    );
    return res.data.data;
};

export const createTag = async (workspaceId, projectId, payload) => {
    // POST /workspaces/:wid/projects/:pid/tasks/tags/create
    const res = await api.post(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/tags/create`,
        payload
    );
    return res.data.data;
};

export const attachTag = async (workspaceId, projectId, taskId, tagId) => {
    // POST /:taskId/tags -> /workspaces/.../tasks/:taskId/tags
    const res = await api.post(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/tags`,
        { tagId }
    );
    return res.data;
};

export const detachTag = async (workspaceId, projectId, taskId, tagId) => {
    // DELETE /:taskId/tags/:tagId
    const res = await api.delete(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/tags/${tagId}`
    );
    return res.data;
};
