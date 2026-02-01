import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjectById,
  createProject,
  listProjects,
} from "../services/projectService";

// LIST PROJECTS (User's projects)
export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await listProjects();
      // Service now returns res.data directly or we handle it there.
      // projects/projectService.js: returns res.data
      return Array.isArray(res) ? res : res?.data ?? [];
    },
  });
};

// GET SINGLE PROJECT
export const useProject = (projectId) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await getProjectById(projectId);
      return res?.data ?? res ?? null;
    },
    enabled: !!projectId,
  });
};

// CREATE PROJECT
export const useCreateProject = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createProject(payload),
    onSuccess: () => {
      qc.invalidateQueries(["projects"]);
    },
  });
};
