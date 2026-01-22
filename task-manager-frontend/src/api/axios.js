import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true, // REQUIRED for refresh cookies
});

/* ------------------------------------------------------------------ */
/* 🔐 REQUEST: attach access token                                     */
/* ------------------------------------------------------------------ */
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ------------------------------------------------------------------ */
/* 🔁 RESPONSE: refresh token flow                                     */
/* ------------------------------------------------------------------ */

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If not 401 → propagate
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // If refresh itself failed → logout hard
    if (originalRequest.url?.includes("/auth/refresh")) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    // Prevent infinite retry loop
    if (originalRequest._retry) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Queue requests while refresh is in flight
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const res = await api.post("/api/v1/auth/refresh");
      const newAccessToken = res.data.data.accessToken;

      useAuthStore.getState().setAuth(newAccessToken, useAuthStore.getState().user);

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
