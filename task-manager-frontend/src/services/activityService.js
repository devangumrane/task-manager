import api from "./api";

export const getWorkspaceActivity = async (workspaceId) => {
  const res = await api.get(`/workspaces/${workspaceId}/activity`);
  return res.data.data;
};