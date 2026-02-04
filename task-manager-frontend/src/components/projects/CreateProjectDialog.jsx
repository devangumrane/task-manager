import { useState } from "react";
import { useCreateProject } from "../../hooks/useProjects";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from "@mui/material";

export default function CreateProjectDialog({ open, onClose, workspaceId }) {
  const [name, setName] = useState("");
  const createProject = useCreateProject(workspaceId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    createProject.mutate(
      { name, workspaceId },
      {
        onSuccess: () => {
          setName("");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={createProject.isPending}>
            {createProject.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
