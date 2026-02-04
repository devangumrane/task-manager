import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Paper, Box, Typography, Chip } from "@mui/material";
import KanbanCard from "./KanbanCard";

const titleMap = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function KanbanColumn({ status, tasks, onTaskClick }) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <Box display="flex" flexDirection="column" width={320} flexShrink={0}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} px={1}>
        <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
          {titleMap[status]}
        </Typography>
        <Chip
          label={tasks.length}
          size="small"
          sx={{ height: 20, bgcolor: 'action.hover', fontWeight: 'bold' }}
        />
      </Box>

      <Paper
        ref={setNodeRef}
        elevation={0}
        variant="outlined"
        sx={{
          flex: 1,
          bgcolor: 'background.default',
          p: 1,
          borderRadius: 2,
          minHeight: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          transition: 'border-color 0.2s',
          '&:hover': { borderColor: 'primary.main' }
        }}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <Box height="100%" display="flex" alignItems="center" justifyContent="center">
            <Typography variant="body2" color="text.disabled" fontStyle="italic">
              No tasks
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
