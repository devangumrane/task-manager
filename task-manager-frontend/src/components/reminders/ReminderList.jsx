import { BellOff } from "lucide-react";
import ReminderItem from "./ReminderItem";

export default function ReminderList({ reminders = [], onDelete }) {
    if (reminders.length === 0) {
        return (
            <div className="text-center py-6 text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
                <BellOff className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No reminders set.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {reminders.map((reminder) => (
                <ReminderItem
                    key={reminder.id}
                    reminder={reminder}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
