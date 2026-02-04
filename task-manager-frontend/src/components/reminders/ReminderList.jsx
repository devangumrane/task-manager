import { BellOff } from "lucide-react";
import { Box, Typography, Stack } from "@mui/material";
import ReminderItem from "./ReminderItem";

export default function ReminderList({ reminders = [], onDelete }) {
    if (reminders.length === 0) {
        return (
            <Box
                textAlign="center"
                py={3}
                bgcolor="action.hover"
                borderRadius={2}
                border={1}
                borderColor="divider"
                sx={{ borderStyle: 'dashed' }}
            >
                <Box color="text.disabled" mb={1}>
                    <BellOff size={32} />
                </Box>
                <Typography variant="body2" color="text.secondary">No reminders set.</Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={2}>
            {reminders.map((reminder) => (
                <ReminderItem
                    key={reminder.id}
                    reminder={reminder}
                    onDelete={onDelete}
                />
            ))}
        </Stack>
    );
}
