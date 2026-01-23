import api from "./api";

export const missionService = {
    getAll: async (skillId) => {
        const res = await api.get("/missions", { params: { skillId } });
        return res.data.data;
    },

    getOne: async (id) => {
        const res = await api.get(`/missions/${id}`);
        return res.data.data;
    },

    submit: async (id, data) => {
        // TODO: Implement submission endpoint in backend if not exists, or usage generic patch
        // For now assuming we might simply patch status
        const res = await api.patch(`/missions/${id}/submit`, data);
        return res.data.data;
    },
};
