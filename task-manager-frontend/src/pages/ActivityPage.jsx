import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Link as MuiLink
} from "@mui/material";

import { getWorkspaceActivity } from "../services/activityService";

export default function ActivityPage() {
  const { workspaceId } = useParams();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activity", workspaceId],
    queryFn: () => getWorkspaceActivity(workspaceId),
    enabled: !!workspaceId,
  });

  if (isLoading) return (
    <Box p={4} display="flex" justifyContent="center">
      <CircularProgress />
    </Box>
  );

  if (activities.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" p={2}>
        No activity yet.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="600" mb={3}>Activity Log</Typography>

      <List component={Paper} variant="outlined" sx={{ p: 0 }}>
        {activities.map((a, i) => (
          <ListItem
            key={a.id}
            divider={i < activities.length - 1}
            sx={{ gap: 1 }}
          >
            <ListItemText
              primary={
                <Box component="span">
                  {/* User */}
                  {a.user ? (
                    <MuiLink
                      component={Link}
                      to={`/users/${a.user.id}`}
                      underline="hover"
                      fontWeight="medium"
                      sx={{ mr: 0.5 }}
                    >
                      {a.user.name || a.user.email}
                    </MuiLink>
                  ) : (
                    <Typography component="span" color="text.disabled" sx={{ mr: 0.5 }}>Someone</Typography>
                  )}

                  {/* Action */}
                  <Typography component="span" variant="body2" color="text.primary">
                    {humanizeActivity(a)}
                  </Typography>
                </Box>
              }
            />

            {/* Time */}
            <Typography variant="caption" color="text.secondary" whiteSpace="nowrap">
              {new Date(a.createdAt).toLocaleString()}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

function humanizeActivity(activity) {
  switch (activity.type) {
    case "task.created":
      return "created a task";
    case "task.updated":
      return "updated a task";
    case "task.deleted":
      return "deleted a task";
    case "user.profile_updated":
      return "updated their profile";
    default:
      return activity.type;
  }
}
