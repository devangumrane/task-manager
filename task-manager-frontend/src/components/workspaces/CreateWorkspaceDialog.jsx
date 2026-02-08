import { useState } from "react";
import toast from "react-hot-toast";
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
    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    createWorkspace.mutate(
      { name },
      {
        onSuccess: () => {
          toast.success("Workspace created successfully");
          setName("");
          if (onSuccess) onSuccess();
          else onClose();
        },
        onError: (error) => {
          console.error("Create workspace failed:", error);
          const msg = error?.response?.data?.message || "Failed to create workspace";
          toast.error(msg);
        }
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
