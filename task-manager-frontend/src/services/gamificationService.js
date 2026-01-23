import api from "./api";

export const gamificationService = {
    getStats: async () => {
        const res = await api.get("/gamification/stats");
        return res.data.data;
    },
};
