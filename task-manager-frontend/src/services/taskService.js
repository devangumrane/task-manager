// src/services/taskService.js
import api from "./api";

export const getTasksByProject = async (projectId) => {
  const res = await api.get(`/projects/${projectId}/tasks`);
  return res.data.data ?? [];
};

export const getTaskById = async (projectId, taskId) => {
  const res = await api.get(`/projects/${projectId}/tasks/${taskId}`);
  return res.data.data;
};

export const getTaskAttachments = async (projectId, taskId) => {
  return [];
};

export const createTask = async (projectId, payload) => {
  const res = await api.post(`/projects/${projectId}/tasks`, payload);
  return res.data.data;
};

export const updateTaskStatus = async (projectId, taskId, payload) => {
  const res = await api.patch(
    `/projects/${projectId}/tasks/${taskId}`,
    payload
  );
  return res.data.data;
};