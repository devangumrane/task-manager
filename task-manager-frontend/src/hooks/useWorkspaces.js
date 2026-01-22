import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listWorkspaces,
  getWorkspace,
  createWorkspace,
} from "../services/workspaceService";

export const useWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await listWorkspaces();

      // Backend shape:
      // { success: true, data: [ ... ] }

      const workspaces = res?.data;

      return Array.isArray(workspaces) ? workspaces : [];
    },
  });
};

export const useWorkspace = (workspaceId) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspace(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries(["workspaces"]);
    },
  });
};
