import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Link2, X, AlertCircle, Plus, Search } from "lucide-react";
import { addDependency, removeDependency } from "../../services/dependencyService";
import { getTasksByProject } from "../../services/taskService";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

export default function DependencyList({ workspaceId, projectId, task }) {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const taskId = task.id;
    const blockers = task.blockers || []; // Tasks blocking THIS task
    const blocking = task.blocking || []; // Tasks BLOCKED by this task

    // Fetch all tasks for selection
    const { data: allTasks } = useQuery({
        queryKey: ["tasks", workspaceId, projectId],
        queryFn: () => getTasksByProject(workspaceId, projectId),
        enabled: isAdding
    });

    const addDependencyMutation = useMutation({
        mutationFn: (blockerId) => addDependency(workspaceId, projectId, taskId, blockerId),
        onSuccess: () => {
            queryClient.invalidateQueries(["task", workspaceId, projectId, String(taskId)]);
            setIsAdding(false);
        },
    });

    const removeDependencyMutation = useMutation({
        mutationFn: (blockerId) => removeDependency(workspaceId, projectId, taskId, blockerId),
        onSuccess: () => {
            queryClient.invalidateQueries(["task", workspaceId, projectId, String(taskId)]);
        },
    });

    // Filter valid blockers (not self, not already blocking)
    // Also ideally prevent cycles, but backend catches that.
    const availableBlockers = allTasks?.filter(t =>
        t.id !== taskId &&
        !blockers.some(b => b.id === t.id) &&
        !blocking.some(b => b.id === t.id) // Simple immediate cycle prevention
    ) || [];

    const filteredTasks = availableBlockers.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">

            {/* Blockers Section */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                        <AlertCircle size={14} className="text-orange-400" /> Blocked By
                    </h4>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="p-1 hover:bg-white/10 rounded text-primary transition-colors"
                        title="Add Dependency"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                {/* List of Blockers */}
                <div className="space-y-2">
                    {blockers.length === 0 && !isAdding && (
                        <p className="text-xs text-muted-foreground italic pl-6">No blocking tasks.</p>
                    )}

                    {blockers.map(blocker => (
                        <div key={blocker.id} className="flex items-center justify-between p-2 rounded bg-white/5 text-sm group">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${blocker.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                <span className={blocker.status === 'completed' ? 'line-through text-muted-foreground' : 'text-white'}>
                                    {blocker.title}
                                </span>
                            </div>
                            <button
                                onClick={() => removeDependencyMutation.mutate(blocker.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-400 rounded transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}

                    {/* Add Dropdown */}
                    <AnimatePresence>
                        {isAdding && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="relative"
                            >
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs text-white focus:border-primary mb-1"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                                <div className="max-h-32 overflow-y-auto custom-scrollbar bg-black/40 border border-white/10 rounded">
                                    {filteredTasks.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => addDependencyMutation.mutate(t.id)}
                                            className="w-full text-left p-2 hover:bg-white/10 text-xs text-gray-300 truncate"
                                        >
                                            #{t.id} {t.title}
                                        </button>
                                    ))}
                                    {filteredTasks.length === 0 && (
                                        <p className="text-[10px] text-muted-foreground p-2">No tasks found.</p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Blocking Section (Read Only) */}
            {blocking.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2 mb-2">
                        <Link2 size={14} className="text-blue-400" /> Blocking
                    </h4>
                    <div className="space-y-2">
                        {blocking.map(t => (
                            <div key={t.id} className="flex items-center gap-2 p-2 rounded bg-white/5 text-xs text-muted-foreground opacity-75">
                                <span className="truncate">{t.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
