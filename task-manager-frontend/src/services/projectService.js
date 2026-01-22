import api from "./api";

export const createProject = async (workspaceId, payload) => {
  const res = await api.post(`/workspaces/${workspaceId}/projects`, payload);
  return res.data;
};

export const getProjectById = async (workspaceId, projectId) => {
  const res = await api.get(
    `/workspaces/${workspaceId}/projects/${projectId}`
  );
  return res.data;
};

export const listProjects = async (workspaceId) => {
  const res = await api.get(`/workspaces/${workspaceId}/projects`);
  return res.data;
};

export const getTasksByProject = async (workspaceId, projectId) => {
  const res = await api.get(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks`
  );
  return res.data;
};
