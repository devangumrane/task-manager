import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        variant={destructive ? "destructive" : "default"}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
