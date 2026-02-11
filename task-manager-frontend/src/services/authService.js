import api from "./api";

// ---------------- LOGIN ----------------
export const login = async (payload) => {
  const res = await api.post("/auth/login", payload);
  return res;
};

// ---------------- REGISTER ----------------
export const register = async (payload) => {
  const res = await api.post("/auth/register", payload);
  return res;
};

// ---------------- LOGOUT ----------------
export const logout = async () => {
  // Assuming logout endpoint is also under /api/v1/auth ?
  // Original was /api/auth/logout. Wait.
  // Original login: /api/v1/auth/login.
  // Original logout: /api/auth/logout. Missing /v1?
  // Let's assume standard is /api/v1/auth/logout.
  // If backend is consistent, it should be /auth/logout relative to base /api/v1.
  const res = await api.post("/auth/logout");
  return res;
};
