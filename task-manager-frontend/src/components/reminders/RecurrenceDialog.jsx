import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setRecurring, removeRecurring } from "../../services/recurringService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../shared/Dialog";
// Assuming a Dialog component exists or using standard UI
import { X, Calendar, RotateCcw } from "lucide-react";

// Simple Cron Builder or Text Input
// For MVP: Text input with examples
export default function RecurrenceDialog({ open, onOpenChange, workspaceId, projectId, task }) {
    const queryClient = useQueryClient();
    const [cron, setCron] = useState(task.recurring?.cron_expression || "0 9 * * 1"); // Default: Every Monday at 9am
    // If task already has recurring rule?
    // We need to know if it does. Backend returns 'recurring' object on task get?
    // We added association? Yes, HasOne.

    const setMutation = useMutation({
        mutationFn: () => setRecurring(workspaceId, projectId, task.id, cron),
        onSuccess: () => {
            queryClient.invalidateQueries(["task", workspaceId, projectId, String(task.id)]);
            onOpenChange(false);
        }
    });

    const removeMutation = useMutation({
        mutationFn: () => removeRecurring(workspaceId, projectId, task.id),
        onSuccess: () => {
            queryClient.invalidateQueries(["task", workspaceId, projectId, String(task.id)]);
            onOpenChange(false);
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-zinc-900/95 border border-white/10 backdrop-blur-xl text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RotateCcw size={18} className="text-primary" /> recurring Schedule
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                        Enter a cron expression to schedule this task.
                    </p>

                    <input
                        type="text"
                        value={cron}
                        onChange={(e) => setCron(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:border-primary focus:outline-none"
                        placeholder="* * * * *"
                    />

                    <div className="bg-white/5 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Examples</p>
                        <div className="grid grid-cols-1 gap-2 text-xs text-gray-400 font-mono">
                            <button onClick={() => setCron("0 9 * * 1")} className="text-left hover:text-white transition-colors">0 9 * * 1 (Every Monday @ 9am)</button>
                            <button onClick={() => setCron("0 9 * * *")} className="text-left hover:text-white transition-colors">0 9 * * * (Daily @ 9am)</button>
                            <button onClick={() => setCron("0 0 1 * *")} className="text-left hover:text-white transition-colors">0 0 1 * * (1st of every month)</button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                    {task.recurring ? (
                        <button
                            onClick={() => removeMutation.mutate()}
                            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20"
                        >
                            Remove Rule
                        </button>
                    ) : <div></div>}

                    <div className="flex gap-2">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="px-4 py-2 rounded-lg hover:bg-white/5 text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setMutation.mutate()}
                            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
                        >
                            Save Schedule
                        </button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
