import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjectById,
  getTasksByProject,
  createProject,
  listProjects,
  listAllProjects,
} from "../services/projectService";

// LIST PROJECTS FOR WORKSPACE
// LIST PROJECTS (Workspace or Global)
export const useProjects = (workspaceId) => {
  return useQuery({
    queryKey: workspaceId ? ["workspaceProjects", workspaceId] : ["allProjects"],
    queryFn: async () => {
      if (workspaceId) {
        const res = await listProjects(workspaceId);
        return Array.isArray(res?.data) ? res.data : [];
      } else {
        const res = await listAllProjects();
        return Array.isArray(res?.data) ? res.data : [];
      }
    },
    enabled: true,
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
    mutationFn: (payload) => createProject(payload.workspaceId || workspaceId, payload),
    onSuccess: (data, variables) => {
      const targetWsId = variables.workspaceId || workspaceId;
      if (targetWsId) {
        qc.invalidateQueries(["workspaceProjects", targetWsId]);
      }
      qc.invalidateQueries(["workspaces"]);
    },
  });
};
