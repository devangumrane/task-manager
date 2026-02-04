/* eslint-disable react/prop-types */
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Skeleton,
  Typography,
  Box
} from "@mui/material";

export default function WorkspaceTable({ workspaces, isLoading, onRowClick }) {
  const items = Array.isArray(workspaces) ? workspaces : [];

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="workspaces table">
        <TableHead sx={{ bgcolor: 'background.default' }}>
          <TableRow>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Created</strong></TableCell>
            <TableCell align="right"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <LoadingRows />
          ) : items.length === 0 ? (
            <EmptyRow />
          ) : (
            items.map((ws) => (
              <TableRow
                key={ws.id}
                hover
                onClick={() => onRowClick?.(ws)}
                sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="subtitle2">{ws.name}</Typography>
                </TableCell>
                <TableCell>
                  {ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick?.(ws);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton variant="text" width={150} /></TableCell>
          <TableCell><Skeleton variant="text" width={100} /></TableCell>
          <TableCell align="right"><Skeleton variant="rectangular" width={60} height={30} sx={{ ml: 'auto' }} /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

function EmptyRow() {
  return (
    <TableRow>
      <TableCell colSpan={3}>
        <Box p={4} textAlign="center">
          <Typography color="text.secondary">No workspaces yet. Create your first one.</Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}
