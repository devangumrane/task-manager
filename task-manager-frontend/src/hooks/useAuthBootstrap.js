import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export function useAuthBootstrap() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);

  useEffect(() => {
    if (isBootstrapped) return;

    const token = localStorage.getItem("token");

    if (token) {
      bootstrap(token);
    } else {
      bootstrap(null);
    }
  }, [bootstrap, isBootstrapped]);
}
