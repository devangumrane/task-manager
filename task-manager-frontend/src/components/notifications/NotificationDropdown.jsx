import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead, markAllAsRead } from "../../services/notificationService";
import { Bell, Check, Clock, Info } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ROUTES } from "../../router/paths";

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const queryClient = useQueryClient();

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: () => getNotifications(1, 10),
        refetchInterval: 30000, // Poll every 30s
    });

    const notifications = data?.data || [];
    const unreadCount = data?.meta?.unreadCount || 0;

    const markReadMutation = useMutation({
        mutationFn: markAsRead,
        onSuccess: () => queryClient.invalidateQueries(["notifications"]),
    });

    const markAllMutation = useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => queryClient.invalidateQueries(["notifications"]),
    });

    const handleNotificationClick = (n) => {
        if (!n.isRead) markReadMutation.mutate(n.id);
        setIsOpen(false);
    };

    const getLink = (n) => {
        if (n.data?.taskId && n.data?.projectId && n.data?.workspaceId) {
            return ROUTES.TASK(n.data.workspaceId, n.data.projectId, n.data.taskId);
        }
        return "#";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-white transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 mt-2 w-80 md:w-96 glass-panel border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/20">
                            <h3 className="font-semibold text-sm text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllMutation.mutate()}
                                    className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                                >
                                    <Check size={12} /> Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {isLoading ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                                    Loading...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Bell size={24} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <Link
                                        key={n.id}
                                        to={getLink(n)}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`block px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors relative ${!n.isRead ? "bg-primary/5" : ""
                                            }`}
                                    >
                                        {!n.isRead && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                        )}
                                        <div className="flex gap-3">
                                            <div className="mt-1 min-w-[24px]">
                                                {n.type === 'task_assigned' ? (
                                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                                        <Info size={14} />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-white/10 text-muted-foreground flex items-center justify-center">
                                                        <Bell size={14} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!n.isRead ? "text-white font-medium" : "text-muted-foreground"}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground/80 line-clamp-2 mt-0.5">
                                                    {n.body}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/50 mt-2 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        <div className="p-2 border-t border-white/5 bg-black/20 text-center">
                            <Link to="/notifications" className="text-xs text-muted-foreground hover:text-white transition-colors">
                                View all history
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
