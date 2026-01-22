// src/hooks/useTasks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTaskStatus,
} from "../services/taskService";

export const useProjectTasks = (workspaceId, projectId) => {
  return useQuery({
    queryKey: ["projectTasks", workspaceId, projectId],
    queryFn: async () => {
      const res = await getTasksByProject(workspaceId, projectId);
      return Array.isArray(res) ? res : res?.data ?? [];
    },
    enabled: !!workspaceId && !!projectId,
  });
};

export const useTask = (workspaceId, projectId, taskId) => {
  return useQuery({
    queryKey: ["task", workspaceId, projectId, taskId],
    queryFn: () => getTaskById(workspaceId, projectId, taskId),
    enabled: !!workspaceId && !!projectId && !!taskId,
  });
};

export const useCreateTask = (workspaceId, projectId) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createTask(workspaceId, projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries(["projectTasks", workspaceId, projectId]);
    },
  });
};

export const useUpdateTaskStatus = (workspaceId, projectId) => {
  const qc = useQueryClient();

  return useMutation({
    // HARD CONTRACT: ONLY status allowed
    mutationFn: ({ taskId, status }) =>
      updateTaskStatus(
        workspaceId,
        projectId,
        taskId,
        { status } // <-- EXACT backend schema
      ),

    // OPTIMISTIC UPDATE
    onMutate: async ({ taskId, status }) => {
      await qc.cancelQueries(["projectTasks", workspaceId, projectId]);

      const previousTasks = qc.getQueryData([
        "projectTasks",
        workspaceId,
        projectId,
      ]);

      qc.setQueryData(
        ["projectTasks", workspaceId, projectId],
        (old = []) =>
          old.map((task) =>
            task.id === taskId ? { ...task, status } : task
          )
      );

      return { previousTasks };
    },

    // ROLLBACK
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(
        ["projectTasks", workspaceId, projectId],
        ctx?.previousTasks
      );
    },

    // FINAL SYNC
    onSettled: () => {
      qc.invalidateQueries(["projectTasks", workspaceId, projectId]);
    },
  });
};
