import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, Typography, Chip, Box, Avatar } from "@mui/material";

const priorityColors = {
  LOW: { bg: "#f3f4f6", text: "#4b5563" }, // gray
  MEDIUM: { bg: "#dbeafe", text: "#1d4ed8" }, // blue
  HIGH: { bg: "#ffedd5", text: "#c2410c" }, // orange
  URGENT: { bg: "#fee2e2", text: "#b91c1c" }, // red
};

export default function KanbanCard({ task, isOverlay, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isOverlay ? 999 : 'auto',
  };

  if (!task) return null;

  const prioColor = priorityColors[task.priority] || priorityColors.MEDIUM;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      sx={{
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        position: 'relative',
        boxShadow: isOverlay ? 4 : 1,
        // Using sx for conditional styles is tricky with styled-engine, keeping raw style for dnd
        '&:hover': { boxShadow: 3 }
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="subtitle2" fontWeight="600" gutterBottom noWrap>
          {task.title}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Chip
            label={task.priority || "MEDIUM"}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: prioColor.bg,
              color: prioColor.text,
              fontWeight: 'bold'
            }}
          />

          {task.assigned && (
            <Avatar
              src={task.assigned.profileImage}
              sx={{ width: 24, height: 24, fontSize: 10, bgcolor: 'secondary.main' }}
            >
              {task.assigned.name?.substring(0, 2)?.toUpperCase() || "U"}
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
