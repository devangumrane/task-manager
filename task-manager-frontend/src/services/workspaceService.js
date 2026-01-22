import api from "./api";

export const listWorkspaces = async () => {
  const res = await api.get(`/workspaces`);
  return res.data;
};

export const getWorkspace = async (workspaceId) => {
  const res = await api.get(`/workspaces/${workspaceId}`);
  return res.data;
};

export const createWorkspace = async (payload) => {
  const res = await api.post(`/workspaces`, payload);
  return res.data;
};
