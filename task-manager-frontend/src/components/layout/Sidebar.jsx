import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Home, Grid, Users, FileText } from "lucide-react";
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
    } catch {}
  }, [collapsed]);

  // -----------------------------------------
  // Derive active workspaceId from URL
  // /workspaces/:workspaceId/...
  // -----------------------------------------
  const activeWorkspaceId = useMemo(() => {
    const match = location.pathname.match(
      /^\/workspaces\/(\d+)/
    );
    return match ? match[1] : null;
  }, [location.pathname]);

  // -----------------------------------------
  // Navigation (workspace-aware)
  // -----------------------------------------
  const nav = [
    {
      label: "Dashboard",
      to: ROUTES.DASHBOARD,
      icon: Home,
    },
    {
      label: "Workspaces",
      to: ROUTES.WORKSPACES,
      icon: Users,
    },
    {
      label: "Projects",
      to: ROUTES.PROJECTS,
      icon: Grid,
    },
    {
      label: "Activity",
      to: activeWorkspaceId
        ? ROUTES.ACTIVITY(activeWorkspaceId)
        : ROUTES.WORKSPACES,
      icon: FileText,
      disabled: !activeWorkspaceId,
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
        <div className="flex items-center justify-between px-3 h-16 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary-foreground text-primary flex items-center justify-center font-semibold">
              TM
            </div>
            {!collapsed && (
              <span className="ml-2 font-medium">
                Task Manager
              </span>
            )}
          </div>

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
                    aria-disabled={item.disabled}
                    className={`flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm transition
                      ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/40"
                      }
                      ${
                        item.disabled
                          ? "opacity-50 pointer-events-none"
                          : ""
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
