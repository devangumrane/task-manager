import { create } from "zustand";

export const useAuthStore = create((set) => ({

  // STATE
  accessToken: localStorage.getItem("token"),
  user: null,
  isBootstrapped: false,

  // ACTIONS
  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    set({
      accessToken: token,
      user,
      isBootstrapped: true,
    });
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    set({
      accessToken: null,
      user: null,
      isBootstrapped: true,
    });
  },

  bootstrap: () => {
    const token = localStorage.getItem("token");
    set({
      accessToken: token,
      isBootstrapped: true,
    });
  },
}));
