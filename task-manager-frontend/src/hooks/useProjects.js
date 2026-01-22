import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjectById,
  getTasksByProject,
  createProject,
  listProjects,
} from "../services/projectService";

// LIST PROJECTS FOR WORKSPACE
export const useProjects = (workspaceId) => {
  return useQuery({
    queryKey: ["workspaceProjects", workspaceId],
    queryFn: async () => {
      const res = await listProjects(workspaceId);
      return Array.isArray(res?.data) ? res.data : []; // FIXED
    },
    enabled: !!workspaceId,
  });
};

// GET SINGLE PROJECT
export const useProject = (workspaceId, projectId) => {
  return useQuery({
    queryKey: ["project", workspaceId, projectId],
    queryFn: async () => {
      const res = await getProjectById(workspaceId, projectId);
      return res?.data ?? null; // FIXED
    },
    enabled: !!workspaceId && !!projectId,
  });
};

// GET TASKS FOR PROJECT
export const useProjectTasks = (workspaceId, projectId) => {
  return useQuery({
    queryKey: ["projectTasks", workspaceId, projectId],
    queryFn: async () => {
      const res = await getTasksByProject(workspaceId, projectId);
      return Array.isArray(res?.data) ? res.data : []; // FIXED
    },
    enabled: !!workspaceId && !!projectId,
  });
};

// CREATE PROJECT
export const useCreateProject = (workspaceId) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createProject(workspaceId, payload),
    onSuccess: () => {
      qc.invalidateQueries(["workspaceProjects", workspaceId]);
      qc.invalidateQueries(["workspaces"]);
    },
  });
};
