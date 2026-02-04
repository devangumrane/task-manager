import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField
} from "@mui/material";

export default function CreateReminderDialog({ open, onOpenChange, onSubmit }) {
    const [datetime, setDatetime] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!datetime) return;

        try {
            setLoading(true);
            await onSubmit({ reminderTime: new Date(datetime).toISOString(), note });
            setDatetime("");
            setNote("");
            onOpenChange(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => onOpenChange(false)} fullWidth maxWidth="xs">
            <form onSubmit={handleSubmit}>
                <DialogTitle>Set Reminder</DialogTitle>
                <DialogContent>
                    <TextField
                        type="datetime-local"
                        label="Date & Time"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        margin="dense"
                        value={datetime}
                        onChange={(e) => setDatetime(e.target.value)}
                        required
                    />
                    <TextField
                        label="Note (Optional)"
                        fullWidth
                        margin="dense"
                        multiline
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onOpenChange(false)} color="inherit">Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? "Setting..." : "Set Reminder"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
