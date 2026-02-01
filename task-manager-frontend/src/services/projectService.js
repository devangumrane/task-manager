import api from "./api";

export const createProject = async (payload) => {
  const res = await api.post(`/projects`, payload);
  return res.data;
};

export const getProjectById = async (projectId) => {
  const res = await api.get(`/projects/${projectId}`);
  return res.data;
};

export const listProjects = async () => {
  const res = await api.get(`/projects`);
  return res.data;
};

export const getTasksByProject = async (projectId) => {
  const res = await api.get(`/projects/${projectId}/tasks`);
  return res.data;
};
