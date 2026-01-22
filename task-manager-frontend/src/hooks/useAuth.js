import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
} from "../services/authService";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export const useAuth = () => {
  const qc = useQueryClient();
  const { setAuth, clearAuth } = useAuthStore();

  // ---------------- LOGIN -------------------
  const login = useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(accessToken, user);
      qc.invalidateQueries(); // 🔑 ensure fresh data
      toast.success("Logged in successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || "Login failed");
    },
  });

  // ---------------- REGISTER -------------------
  const register = useMutation({
    mutationFn: registerApi,
    onSuccess: () => toast.success("Account created! Please login."),
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || "Registration failed"),
  });

  // ---------------- LOGOUT -------------------
  const logout = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      clearAuth();
      qc.clear();
    },
    onError: () => {
      clearAuth();
      qc.clear();
    },
  });

  return { login, register, logout };
};
