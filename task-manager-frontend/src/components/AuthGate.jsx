import { useAuthStore } from "../store/authStore";
import { useAuthBootstrap } from "../hooks/useAuthBootstrap";

export default function AuthGate({ children }) {
  useAuthBootstrap();
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);

  if (!isBootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-muted-foreground">
          Initializing…
        </span>
      </div>
    );
  }

  return children;
}
