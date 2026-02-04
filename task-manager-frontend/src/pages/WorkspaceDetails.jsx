import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useProjects } from "../hooks/useProjects";
import {
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  CircularProgress,
  Container
} from "@mui/material";
import { Plus } from "lucide-react";
import CreateProjectDialog from "../components/projects/CreateProjectDialog";
import { ROUTES } from "../router/paths";

export default function WorkspaceDetails() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const { data: projects = [], isLoading } = useProjects(workspaceId);
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" fontWeight="600">
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenDialog(true)}
        >
          Project
        </Button>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : projects.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No projects yet. Create one to get started.</Typography>
        </Paper>
      ) : (
        <List component={Paper} variant="outlined" sx={{ p: 0 }}>
          {projects.map((project, index) => (
            <ListItem key={project.id} disablePadding divider={index < projects.length - 1}>
              <ListItemButton onClick={() => navigate(ROUTES.PROJECT(workspaceId, project.id))}>
                <ListItemText
                  primary={project.name}
                  secondary={project.description || "No description"}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      <CreateProjectDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        workspaceId={workspaceId}
      />
    </Container>
  );
}
