import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Grid, User } from "lucide-react";
import { ROUTES } from "../../router/paths";

export default function Sidebar() {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sidebar-collapsed")) || false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "sidebar-collapsed",
        JSON.stringify(collapsed)
      );
    } catch { }
  }, [collapsed]);

  // -----------------------------------------
  // Navigation
  // -----------------------------------------
  const nav = [
    {
      label: "Projects",
      to: ROUTES.PROJECTS,
      icon: Grid,
    },
    {
      label: "Profile",
      to: ROUTES.PROFILE,
      icon: User,
    },
  ];

  return (
    <aside
      className={`flex-shrink-0 h-screen sticky top-0 left-0 z-20 bg-card border-r
        ${collapsed ? "w-16" : "w-64"} transition-all duration-200`}
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col">
        {/* -------------------------------- */}
        {/* Header */}
        {/* -------------------------------- */}
        <div className={`flex items-center h-16 border-b px-3 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary-foreground text-primary flex items-center justify-center font-semibold">
                TM
              </div>
              <span className="ml-2 font-medium">Task Manager</span>
            </div>
          )}

          <button
            aria-label="Toggle sidebar"
            onClick={() => setCollapsed((s) => !s)}
            className="p-2 rounded hover:bg-muted/25"
          >
            <Menu size={16} />
          </button>
        </div>

        {/* -------------------------------- */}
        {/* Navigation */}
        {/* -------------------------------- */}
        <nav className="flex-1 overflow-auto px-1 py-3">
          <ul className="space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.to ||
                location.pathname.startsWith(item.to + "/");

              return (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className={`flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm transition
                      ${isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/40"
                      }
                      ${collapsed ? "justify-center" : ""}`}
                  >
                    <Icon size={18} />
                    {!collapsed && (
                      <span className="truncate">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* -------------------------------- */}
        {/* Footer */}
        {/* -------------------------------- */}
        <div className="px-3 py-4 border-t">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="w-full text-sm p-2 rounded hover:bg-muted/40"
          >
            {!collapsed ? "Logout" : "🚪"}
          </button>
        </div>
      </div>
    </aside>
  );
}
