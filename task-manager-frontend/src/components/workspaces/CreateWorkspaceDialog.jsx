import { useState } from "react";
import { useCreateWorkspace } from "../../hooks/useWorkspaces";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from "@mui/material";

export default function CreateWorkspaceDialog({ open, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const createWorkspace = useCreateWorkspace();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    createWorkspace.mutate(
      { name },
      {
        onSuccess: () => {
          setName("");
          if (onSuccess) onSuccess();
          else onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create Workspace</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Workspace Name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={createWorkspace.isPending}>
            {createWorkspace.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
