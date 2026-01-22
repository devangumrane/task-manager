import { useRef, useState, useEffect } from "react";
import { Search, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "../ThemeProvider";

import SearchInput from "../topbar/SearchInput";
import NotificationsMenu from "../topbar/NotificationsMenu";
import ProfileMenu from "../topbar/ProfileMenu";
import CommandPalette from "../topbar/CommandPalette";

import { useLocation } from "react-router-dom";
import { ROUTES } from "../../router/paths";

export default function Topbar() {
  const { theme, toggle } = useTheme();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  const searchRef = useRef(null);

  // "/" → focus search
  // Ctrl/Cmd + K → open command palette
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && !e.target.closest("input")) {
        e.preventDefault();
        searchRef.current?.focus();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function getPageTitle(pathname) {
    if (pathname === ROUTES.DASHBOARD) return "Dashboard";

    if (pathname.startsWith(ROUTES.WORKSPACES)) {
      return pathname === ROUTES.WORKSPACES
        ? "Workspaces"
        : "Workspace Details";
    }

    if (pathname.startsWith(ROUTES.PROJECTS)) {
      return pathname === ROUTES.PROJECTS ? "Projects" : "Project Details";
    }

    if (pathname.startsWith(ROUTES.ACTIVITY)) return "Activity";

    return "Task Manager";
  }

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 border-b bg-card shadow-sm relative z-30">
        {/* LEFT */}
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>

          {/* Animated Search Input */}
          <div className="hidden lg:block">
            <SearchInput searchRef={searchRef} />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded hover:bg-muted transition"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <NotificationsMenu
            open={notificationsOpen}
            setOpen={setNotificationsOpen}
            closeProfile={() => setProfileOpen(false)}
          />

          {/* Profile */}
          <ProfileMenu
            open={profileOpen}
            setOpen={setProfileOpen}
            closeNotifications={() => setNotificationsOpen(false)}
          />
        </div>
      </header>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onClose={setCommandOpen} />
    </>
  );
}
