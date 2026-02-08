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
  console.log("Creating workspace with payload:", payload);
  try {
    const res = await api.post(`/workspaces`, payload);
    console.log("Create workspace response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Create workspace service error:", error);
    throw error;
  }
};
