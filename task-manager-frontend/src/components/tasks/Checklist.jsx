import { useState } from "react";
import { Plus, Trash2, CheckSquare, Square } from "lucide-react";
import { useSubTasks } from "../../hooks/useSubTasks";

export default function Checklist({ workspaceId, projectId, taskId }) {
    const { subtasks, isLoading, createSubTask, updateSubTask, deleteSubTask } = useSubTasks(workspaceId, projectId, taskId);
    const [newTitle, setNewTitle] = useState("");

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        createSubTask.mutate(newTitle, {
            onSuccess: () => setNewTitle("")
        });
    };

    const handleToggle = (subtask) => {
        updateSubTask.mutate({
            subtaskId: subtask.id,
            updates: { isCompleted: !subtask.isCompleted }
        });
    };

    if (isLoading) return <div className="text-xs text-muted-foreground">Loading subtasks...</div>;

    const total = subtasks?.length || 0;
    const completed = subtasks?.filter(s => s.isCompleted)?.length || 0;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</span>
                <span className="text-xs font-mono text-primary">{progress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* List */}
            <div className="space-y-2 mt-4">
                {subtasks?.map((subtask) => (
                    <div
                        key={subtask.id}
                        className={`
                            group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200
                            ${subtask.isCompleted
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : 'bg-transparent border-white/5 hover:border-white/10 hover:bg-white/5'
                            }
                        `}
                    >
                        <button
                            onClick={() => handleToggle(subtask)}
                            className={`transition-colors ${subtask.isCompleted ? 'text-emerald-500' : 'text-muted-foreground hover:text-white'}`}
                        >
                            {subtask.isCompleted ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>

                        <span
                            className={`flex-1 text-sm ${subtask.isCompleted
                                    ? 'text-muted-foreground line-through decoration-emerald-500/50'
                                    : 'text-gray-300'
                                }`}
                        >
                            {subtask.title}
                        </span>

                        <button
                            onClick={() => deleteSubTask.mutate(subtask.id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Input */}
            <form onSubmit={handleAdd} className="relative mt-2 group">
                <input
                    type="text"
                    placeholder="Add a subtask..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-2 pl-2 pr-10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <button
                    type="submit"
                    disabled={!newTitle.trim()}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary disabled:opacity-50 transition-colors"
                >
                    <Plus size={18} />
                </button>
            </form>
        </div>
    );
}
