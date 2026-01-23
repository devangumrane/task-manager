import api from "./api"; // Assuming api.js is in same folder

export const skillService = {
    getAll: async (category) => {
        const res = await api.get("/skills", { params: { category } });
        return res.data.data;
    },

    getOne: async (id) => {
        const res = await api.get(`/skills/${id}`);
        return res.data.data;
    },

    // Admin only
    create: async (data) => {
        const res = await api.post("/skills", data);
        return res.data.data;
    },
};
