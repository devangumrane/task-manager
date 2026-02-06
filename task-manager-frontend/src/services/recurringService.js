import api from "../api/axios";

export const setRecurring = async (workspaceId, projectId, taskId, cronExpression) => {
    const res = await api.post(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/recurring`,
        { cronExpression }
    );
    return res.data;
};

export const removeRecurring = async (workspaceId, projectId, taskId) => {
    const res = await api.delete(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/recurring`
    );
    return res.data;
};
