import api from "../api/axios";

// ---------------- LOGIN ----------------
export const login = async (payload) => {
  const res = await api.post("/api/v1/auth/login", payload);
  return res;
};

// ---------------- REGISTER ----------------
export const register = async (payload) => {
  const res = await api.post("/api/v1/auth/register", payload);
  return res;
};

// ---------------- LOGOUT ----------------
export const logout = async () => {
  const res = await api.post("/api/auth/logout");
  return res;
};
