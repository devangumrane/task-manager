import { useEffect } from "react";
import { Dialog, DialogContent, TextField, List, ListItem, ListItemText, Typography } from "@mui/material";

export default function CommandPalette({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundImage: 'none',
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {/* Search Bar */}
        <div className="border-b p-3">
          <TextField
            placeholder="Search anything..."
            autoFocus
            fullWidth
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: '1rem' }
            }}
          />
        </div>

        {/* Placeholder Results */}
        <div className="max-h-72 overflow-y-auto">
          <Typography color="text.secondary" p={2} variant="body2">
            Type to search workspaces, projects, tasks...
          </Typography>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* Hook to enable Cmd+K / Ctrl+K shortcut */
export function useCommandShortcut(setOpen) {
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);
}
