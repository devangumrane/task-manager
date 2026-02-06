import api from "../api/axios";

// Start Timer
export const startTimer = async (workspaceId, projectId, taskId) => {
    const res = await api.post(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/timer/start`
    );
    return res.data.data;
};

// Stop Timer
export const stopTimer = async (workspaceId, projectId, taskId) => {
    const res = await api.post(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/timer/stop`
    );
    return res.data.data;
};

// Get Active Timer (Optional, need endpoint or check task status)
// Backend only exposed start/stop.
// But we can check if task has active entry?
// Or relies on global state?
// For now, relies on task being refreshed.
