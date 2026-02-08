import api from "./api";

export const searchGlobal = async (query) => {
    if (!query) return { tasks: [], projects: [], workspaces: [] };
    const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return res.data.data;
};
