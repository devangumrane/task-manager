import axios from "axios";
import { useAuthStore } from "../store/authStore";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status;
    const original = err.config;

    if (status === 401 && !original?._retry) {
      original._retry = true;

      try {
        const refreshRes = await axios.post(
          `${BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshRes.data?.data?.accessToken;
        if (!newToken) throw new Error("No token");

        useAuthStore.getState().setAuth(newToken, null);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().clearAuth();
        return Promise.reject(err);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
