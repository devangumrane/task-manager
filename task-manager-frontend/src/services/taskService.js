// src/services/taskService.js
import api from "./api";

export const getTasksByProject = async (workspaceId, projectId) => {
  const res = await api.get(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks`
  );
  return res.data.data ?? [];
};

export const getTaskById = async (workspaceId, projectId, taskId) => {
  const res = await api.get(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
  );
  return res.data.data;
};

export const getTaskAttachments = async (workspaceId, projectId, taskId) => {
  const res = await api.get(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments`
  );
  return res.data.data ?? [];
};

export const createTask = async (workspaceId, projectId, payload) => {
  const res = await api.post(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    payload
  );
  return res.data.data;
};

export const updateTaskStatus = async (
  workspaceId,
  projectId,
  taskId,
  payload
) => {
  const res = await api.patch(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
    payload
  );
  return res.data.data;
};