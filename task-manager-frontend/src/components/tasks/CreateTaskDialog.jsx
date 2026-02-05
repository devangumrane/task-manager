import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
  Chip,
  Paper
} from "@mui/material";
import RichTextEditor from "../ui/RichTextEditor";
import SkillSelector from "./SkillSelector";

import { useCreateTask } from "../../hooks/useTasks";
import { searchUsers } from "../../services/userService";

export default function CreateTaskDialog({
  open,
  onClose,
  workspaceId,
  projectId,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  // assignee state
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [assigneeResults, setAssigneeResults] = useState([]);
  const [assignedUser, setAssignedUser] = useState(null);

  // skills state
  const [skills, setSkills] = useState([]);

  const createTask = useCreateTask(workspaceId, projectId);

  // ----------------------------------
  // Search users (simple, controlled)
  // ----------------------------------
  const handleAssigneeSearch = async (q) => {
    setAssigneeQuery(q);

    if (!q.trim()) {
      setAssigneeResults([]);
      return;
    }

    try {
      const users = await searchUsers(q);
      setAssigneeResults(users);
    } catch {
      setAssigneeResults([]);
    }
  };

  // ----------------------------------
  // Submit
  // ----------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask.mutate(
      {
        title,
        description,
        priority, // New Field
        skills: skills.map(s => s.id),
        ...(assignedUser?.id ? { assignedTo: assignedUser.id } : {}),
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setPriority("MEDIUM");
          setAssigneeQuery("");
          setAssigneeResults([]);
          setAssignedUser(null);
          setSkills([]);
          onClose();
        },
        onError: (err) => {
          console.error("CREATE TASK ERROR", err);
          alert(err?.response?.data?.error?.message || "Failed to create task");
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create Task</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              autoFocus
              label="Task Title"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>Description</Typography>
              {/* RichTextEditor might need refactoring too, but assuming it works for now or is standalone */}
              <RichTextEditor
                content={description}
                onChange={setDescription}
                placeholder="Describe the task..."
              />
            </Box>

            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                </Select>
              </FormControl>

              <Box>
                {assignedUser ? (
                  <Box display="flex" alignItems="center" gap={1} border={1} borderColor="divider" borderRadius={1} p={1}>
                    <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
                      {assignedUser.name || assignedUser.email}
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setAssignedUser(null)}
                    >
                      Remove
                    </Button>
                  </Box>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <TextField
                      label="Assignee"
                      placeholder="Search user..."
                      fullWidth
                      value={assigneeQuery}
                      onChange={(e) => handleAssigneeSearch(e.target.value)}
                      autoComplete="off"
                    />
                    {assigneeResults.length > 0 && (
                      <Paper
                        elevation={3}
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 10,
                          mt: 0.5,
                          maxHeight: 200,
                          overflow: 'auto'
                        }}
                      >
                        {assigneeResults.map((u) => (
                          <MenuItem
                            key={u.id}
                            onClick={() => {
                              setAssignedUser(u);
                              setAssigneeResults([]);
                              setAssigneeQuery("");
                            }}
                          >
                            {u.name || u.email}
                          </MenuItem>
                        ))}
                      </Paper>
                    )}
                  </div>
                )}
              </Box>
            </Box>

            <Box>
              <SkillSelector value={skills} onChange={setSkills} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={createTask.isPending}>
            {createTask.isPending ? "Creating..." : "Create Task"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
