import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Square, Clock } from "lucide-react";
import { startTimer, stopTimer } from "../../services/timeTrackingService";

export default function TimeTracker({ workspaceId, projectId, taskId, timeEntries = [] }) {
    const queryClient = useQueryClient();

    // Find if THIS task has an active entry (end_time is null)
    const activeEntry = timeEntries.find(t => !t.end_time);

    // Calculate total duration (sum of completed + current active duration)
    const initialCompletedDuration = timeEntries.reduce((acc, curr) => acc + (curr.duration || 0), 0);

    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        let interval;
        if (activeEntry) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setNow(Date.now()); // Update immediately
            interval = setInterval(() => setNow(Date.now()), 1000);
        }
        return () => clearInterval(interval);
    }, [activeEntry]);

    const elapsed = activeEntry
        ? Math.floor((now - new Date(activeEntry.start_time).getTime()) / 1000)
        : 0;

    const startMutation = useMutation({
        mutationFn: () => startTimer(workspaceId, projectId, taskId),
        onSuccess: () => queryClient.invalidateQueries(["task", workspaceId, projectId, String(taskId)])
    });

    const stopMutation = useMutation({
        mutationFn: () => stopTimer(workspaceId, projectId, taskId),
        onSuccess: () => queryClient.invalidateQueries(["task", workspaceId, projectId, String(taskId)])
    });

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    const totalFormat = formatDuration(initialCompletedDuration + elapsed);

    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/5">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeEntry ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-white/5 text-muted-foreground'}`}>
                    <Clock size={18} />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Time Tracked</p>
                    <p className="text-lg font-mono font-medium text-white tabular-nums leading-none mt-1">
                        {totalFormat}
                    </p>
                </div>
            </div>

            <div>
                {activeEntry ? (
                    <button
                        onClick={() => stopMutation.mutate()}
                        disabled={stopMutation.isPending}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 font-medium text-sm transition-colors border border-red-500/20"
                    >
                        <Square size={14} fill="currentColor" /> Stop
                    </button>
                ) : (
                    <button
                        onClick={() => startMutation.mutate()}
                        disabled={startMutation.isPending}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-medium text-sm transition-colors border border-emerald-500/20"
                    >
                        <Play size={14} fill="currentColor" /> Start
                    </button>
                )}
            </div>
        </div>
    );
}
