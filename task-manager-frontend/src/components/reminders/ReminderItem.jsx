import { format } from "date-fns";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

export default function ReminderItem({ reminder, onDelete }) {
    return (
        <div className="flex items-start justify-between p-3 bg-muted/30 rounded-lg border">
            <div className="flex gap-3">
                <div className="mt-1 text-primary">
                    <Bell size={16} />
                </div>
                <div>
                    <p className="font-medium text-sm">
                        {format(new Date(reminder.reminderTime), "PPP p")}
                    </p>
                    {reminder.note && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {reminder.note}
                        </p>
                    )}
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(reminder.id)}
            >
                <Trash2 size={14} />
            </Button>
        </div>
    );
}
