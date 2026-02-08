import api from "./api";

export const getNotifications = async (page = 1, limit = 20) => {
    const res = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return res.data;
};

export const markAsRead = async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
};

export const markAllAsRead = async () => {
    const res = await api.patch(`/notifications/read-all`);
    return res.data;
};
