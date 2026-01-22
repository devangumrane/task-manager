import { useState } from "react";
import { User, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ROUTES } from "../../router/paths";
import { useAuthStore } from "../../store/authStore";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const logout = () => {
    setOpen(false);
    clearAuth(); // centralized logout
  };

  return (
    <div className="relative">
      {/* Profile Avatar */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center"
      >
        <img
          src="https://ui-avatars.com/api/?name=U&background=ddd&color=111&size=40"
          alt="User"
          className="w-8 h-8 rounded-full border"
        />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-48 bg-popover border rounded-md shadow z-50 text-sm"
          >
            {/* My Profile */}
            <Link
              to={ROUTES.PROFILE}
              onClick={() => setOpen(false)}
              className="w-full px-4 py-2 hover:bg-muted flex items-center gap-2"
            >
              <User size={16} />
              My Profile
            </Link>

            {/* Settings (future) */}
            <button
              disabled
              className="w-full px-4 py-2 opacity-50 cursor-not-allowed flex items-center gap-2"
            >
              <Settings size={16} />
              Settings
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="w-full px-4 py-2 hover:bg-muted text-destructive flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
