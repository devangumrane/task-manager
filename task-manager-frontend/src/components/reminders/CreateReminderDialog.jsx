import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

const schema = z.object({
    reminderTime: z.string().min(1, "Date/Time is required"),
    note: z.string().optional(),
});

export default function CreateReminderDialog({ open, onOpenChange, onSubmit }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const onFormSubmit = async (data) => {
        await onSubmit(data);
        reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Set Reminder</DialogTitle>
                    <DialogDescription>
                        You will receive a notification at the specified time.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="reminderTime">Time</Label>
                        <Input
                            id="reminderTime"
                            type="datetime-local"
                            {...register("reminderTime")}
                        />
                        {errors.reminderTime && (
                            <p className="text-xs text-destructive">{errors.reminderTime.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note">Note (Optional)</Label>
                        <Textarea
                            id="note"
                            placeholder="e.g. Prepare the slide deck"
                            {...register("note")}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Set Reminder"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
