import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Home, Grid, Users, FileText, User, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES } from "../../router/paths";
import { useAuthStore } from "../../store/authStore";

export default function NavSidebar() {
    const location = useLocation();
    const clearAuth = useAuthStore((s) => s.clearAuth);

    const [collapsed, setCollapsed] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("sidebar-collapsed")) || false;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
        } catch { }
    }, [collapsed]);

    const activeWorkspaceId = useMemo(() => {
        const match = location.pathname.match(/^\/workspaces\/(\d+)/);
        return match ? match[1] : null;
    }, [location.pathname]);

    const navItems = [
        { label: "Dashboard", to: ROUTES.DASHBOARD, icon: Home },
        { label: "Workspaces", to: ROUTES.WORKSPACES, icon: Users },
        { label: "Projects", to: ROUTES.PROJECTS, icon: Grid },
        {
            label: "Activity",
            to: activeWorkspaceId ? ROUTES.ACTIVITY(activeWorkspaceId) : ROUTES.WORKSPACES,
            icon: FileText,
            disabled: !activeWorkspaceId,
        },
        { label: "Profile", to: ROUTES.PROFILE, icon: User },
    ];

    const handleLogout = () => {
        clearAuth();
        window.location.href = "/login";
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 80 : 280 }}
            className="fixed left-0 top-0 bottom-0 z-40 flex flex-col glass-panel border-r border-white/5 m-4 rounded-2xl"
        >
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/20">
                                TM
                            </div>
                            <span className="font-bold text-lg tracking-tight">TaskMgr</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 overflow-y-auto">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");

                        return (
                            <li key={item.label}>
                                <Link
                                    to={item.to}
                                    className={`relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                    ${isActive
                                            ? "text-white bg-primary/10 shadow-[0_0_20px_rgba(124,58,237,0.15)]"
                                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                                        }
                    ${item.disabled ? "opacity-50 pointer-events-none" : ""}
                  `}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    <span className={`relative z-10 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors"}`}>
                                        <Icon size={22} />
                                    </span>

                                    <AnimatePresence>
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className="font-medium whitespace-nowrap overflow-hidden relative z-10"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-4 w-full p-3 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors
            ${collapsed ? "justify-center" : ""}
          `}
                >
                    <LogOut size={20} />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="font-medium overflow-hidden"
                            >
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    );
}
