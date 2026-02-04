import { format } from "date-fns";
import { Bell, Trash2 } from "lucide-react";
import { Box, Typography, IconButton } from "@mui/material";

export default function ReminderItem({ reminder, onDelete }) {
    return (
        <Box
            display="flex"
            alignItems="flex-start"
            justifyContent="space-between"
            p={1.5}
            bgcolor="background.paper"
            borderRadius={1}
            border={1}
            borderColor="divider"
        >
            <Box display="flex" gap={2}>
                <Box mt={0.5} color="primary.main">
                    <Bell size={16} />
                </Box>
                <Box>
                    <Typography variant="body2" fontWeight="medium">
                        {format(new Date(reminder.reminderTime), "PPP p")}
                    </Typography>
                    {reminder.note && (
                        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                            {reminder.note}
                        </Typography>
                    )}
                </Box>
            </Box>

            <IconButton
                size="small"
                onClick={() => onDelete(reminder.id)}
                color="default"
                aria-label="delete reminder"
            >
                <Trash2 size={14} />
            </IconButton>
        </Box>
    );
}
