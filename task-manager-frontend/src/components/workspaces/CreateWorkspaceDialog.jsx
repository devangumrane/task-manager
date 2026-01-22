import { useState } from "react";
import { useCreateWorkspace } from "../../hooks/useWorkspaces";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";

export default function CreateWorkspaceDialog({ open, onClose }) {
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
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Input
            placeholder="Workspace name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4"
          />

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createWorkspace.isPending}>
              {createWorkspace.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
