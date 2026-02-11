import axios from "axios";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
});

// Attach access token
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
      // Optional: Toast for non-401 errors if needed, but keeping it clean for now or preserving existing logic
      // Existing logic had toast for >= 500. Let's keep that.
      if (!error.response || error.response.status >= 500) {
        toast.error("Something went wrong. Please try again later.");
      }
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
      // Use axios directly to avoid interceptors loop, and use full URL because API instance has baseURL with /api/v1
      // Actually, BASE_URL is localhost:8001. Refresh endpoint is /api/v1/auth/refresh.
      const res = await axios.post(
        `${BASE_URL}/api/v1/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const newAccessToken = res.data?.data?.accessToken;

      if (!newAccessToken) throw new Error("No token returned");

      useAuthStore.getState().setAuth(newAccessToken, useAuthStore.getState().user); // Keep user? Refresh might not return user.

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
