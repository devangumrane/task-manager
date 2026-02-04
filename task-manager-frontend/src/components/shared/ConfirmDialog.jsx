import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from "@mui/material";

export default function ConfirmDialog({
    open,
    onOpenChange,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    onConfirm,
    confirmText = "Confirm",
    destructive = false,
}) {
    return (
        <Dialog open={open} onClose={() => onOpenChange(false)}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {description}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onOpenChange(false)} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={(e) => {
                        e.preventDefault();
                        onConfirm();
                    }}
                    color={destructive ? "error" : "primary"}
                    variant="contained"
                    autoFocus
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
