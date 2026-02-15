import { useQuery } from "@tanstack/react-query";
import { getMyTasks } from "../services/taskService";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, AlertTriangle, ArrowRight, Layout } from "lucide-react";
import { Link } from "react-router-dom";
import GlassCard from "../components/shared/GlassCard";
import { ROUTES } from "../router/paths";

export default function MyTasks() {
    const { data: tasks, isLoading } = useQuery({
        queryKey: ["myTasks"],
        queryFn: getMyTasks,
    });

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const getPriorityColor = (p) => {
        switch (p?.toLowerCase()) {
            case "high": return "text-red-400 bg-red-400/10 border-red-400/20";
            case "medium": return "text-orange-400 bg-orange-400/10 border-orange-400/20";
            default: return "text-blue-400 bg-blue-400/10 border-blue-400/20";
        }
    };

    const getStatusIcon = (s) => {
        switch (s) {
            case "completed": return <CheckCircle size={16} className="text-emerald-400" />;
            case "in_progress": return <Clock size={16} className="text-blue-400" />;
            default: return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Layout className="text-primary" />
                    My Tasks
                </h1>
                <p className="text-muted-foreground">
                    View all tasks assigned to you across all workspaces and projects.
                </p>
            </motion.div>

            <div className="space-y-4">
                {tasks?.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground bg-white/5 rounded-2xl border border-white/5">
                        <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg">All caught up! No tasks assigned to you.</p>
                    </div>
                ) : (
                    tasks?.map((task, i) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <GlassCard className="group hover:bg-white/10 transition-colors border-l-4 border-l-primary/50">
                                <div className="flex items-center gap-4">
                                    {/* Status */}
                                    <div className="p-2 rounded-lg bg-black/20">
                                        {getStatusIcon(task.status)}
                                    </div>

                                    {/* Main Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-semibold text-white truncate group-hover:text-primary transition-colors">
                                                {task.title}
                                            </h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${getPriorityColor(task.priority)}`}>
                                                {task.priority || 'NORMAL'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{task.project?.workspace?.name}</span>
                                            <span>/</span>
                                            <span className="text-white/60">{task.project?.name}</span>
                                            {task.deadline && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                                    <span className={`flex items-center gap-1 ${new Date(task.deadline) < new Date() ? 'text-red-400' : ''}`}>
                                                        <Clock size={12} />
                                                        {new Date(task.deadline).toLocaleDateString()}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <Link
                                        to={ROUTES.TASK(task.project.workspace_id, task.project.id, task.id)}
                                        className="p-2 rounded-lg bg-white/5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white transition-all transform translate-x-2 group-hover:translate-x-0"
                                    >
                                        <ArrowRight size={20} />
                                    </Link>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
