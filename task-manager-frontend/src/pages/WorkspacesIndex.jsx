import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { listWorkspaces } from "../services/workspaceService";
import {
  Button,
  Typography,
  Box,
  Container,
  Paper,
  CircularProgress
} from "@mui/material";
import WorkspaceTable from "../components/workspaces/WorkspaceTable";
import CreateWorkspaceDialog from "../components/workspaces/CreateWorkspaceDialog";

export default function WorkspacesIndex() {
  const [openCreate, setOpenCreate] = useState(false);

  const { data: workspaces = [], isLoading, refetch } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await listWorkspaces();
      return res.data || [];
    }
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Workspaces
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your teams and projects.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenCreate(true)}
        >
          Create Workspace
        </Button>
      </Box>

      <Paper elevation={0} variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
        {isLoading ? (
          <Box p={4} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : workspaces.length === 0 ? (
          <Box p={6} textAlign="center">
            <Typography variant="h6" gutterBottom>No workspaces yet</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Create your first workspace to get started.
            </Typography>
            <Button variant="outlined" onClick={() => setOpenCreate(true)}>
              Create Workspace
            </Button>
          </Box>
        ) : (
          <WorkspaceTable data={workspaces} />
        )}
      </Paper>

      <CreateWorkspaceDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={() => {
          refetch();
          setOpenCreate(false);
        }}
      />
    </Container>
  );
}
