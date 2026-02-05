import { useState } from "react";
import { Plus, Trash2, CheckSquare, Square } from "lucide-react";
import { useSubTasks } from "../../hooks/useSubTasks";
import {
    Box,
    Typography,
    IconButton,
    InputBase,
    Paper,
    CircularProgress,
    LinearProgress
} from "@mui/material";

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

    if (isLoading) return <CircularProgress size={20} />;

    const total = subtasks?.length || 0;
    const completed = subtasks?.filter(s => s.isCompleted)?.length || 0;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Checklist</Typography>
                <Typography variant="caption" color="text.secondary">{progress}%</Typography>
            </Box>

            <LinearProgress variant="determinate" value={progress} sx={{ mb: 2, height: 6, borderRadius: 3 }} />

            <Box display="flex" flexDirection="column" gap={1}>
                {subtasks?.map((subtask) => (
                    <Paper
                        key={subtask.id}
                        variant="outlined"
                        sx={{
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            borderColor: subtask.isCompleted ? 'success.light' : 'divider',
                            bgcolor: subtask.isCompleted ? 'success.lighter' : 'transparent'
                        }}
                    >
                        <IconButton
                            size="small"
                            color={subtask.isCompleted ? "success" : "default"}
                            onClick={() => handleToggle(subtask)}
                        >
                            {subtask.isCompleted ? <CheckSquare size={18} /> : <Square size={18} />}
                        </IconButton>

                        <Typography
                            variant="body2"
                            sx={{
                                flex: 1,
                                textDecoration: subtask.isCompleted ? 'line-through' : 'none',
                                color: subtask.isCompleted ? 'text.secondary' : 'text.primary'
                            }}
                        >
                            {subtask.title}
                        </Typography>

                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteSubTask.mutate(subtask.id)}
                        >
                            <Trash2 size={16} />
                        </IconButton>
                    </Paper>
                ))}
            </Box>

            <Paper
                component="form"
                onSubmit={handleAdd}
                variant="outlined"
                sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    mt: 2,
                    borderStyle: 'dashed'
                }}
            >
                <InputBase
                    sx={{ ml: 1, flex: 1, fontSize: 14 }}
                    placeholder="Add an item..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                />
                <IconButton type="submit" color="primary" sx={{ p: '10px' }} disabled={!newTitle.trim()}>
                    <Plus size={18} />
                </IconButton>
            </Paper>
        </Box>
    );
}
