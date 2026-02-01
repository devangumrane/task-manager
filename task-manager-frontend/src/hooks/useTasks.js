// src/hooks/useTasks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTaskStatus,
} from "../services/taskService";

export const useProjectTasks = (projectId) => {
  return useQuery({
    queryKey: ["projectTasks", projectId],
    queryFn: async () => {
      const res = await getTasksByProject(projectId);
      return Array.isArray(res) ? res : res ?? [];
    },
    enabled: !!projectId,
  });
};

export const useTask = (projectId, taskId) => {
  return useQuery({
    queryKey: ["task", projectId, taskId],
    queryFn: () => getTaskById(projectId, taskId),
    enabled: !!projectId && !!taskId,
  });
};

export const useCreateTask = (projectId) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createTask(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries(["projectTasks", projectId]);
    },
  });
};

export const useUpdateTaskStatus = (projectId) => {
  const qc = useQueryClient();

  return useMutation({
    // HARD CONTRACT: ONLY status allowed
    mutationFn: ({ taskId, status }) =>
      updateTaskStatus(
        projectId,
        taskId,
        { status }
      ),

    // OPTIMISTIC UPDATE
    onMutate: async ({ taskId, status }) => {
      await qc.cancelQueries(["projectTasks", projectId]);

      const previousTasks = qc.getQueryData([
        "projectTasks",
        projectId,
      ]);

      qc.setQueryData(
        ["projectTasks", projectId],
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
        ["projectTasks", projectId],
        ctx?.previousTasks
      );
    },

    // FINAL SYNC
    onSettled: () => {
      qc.invalidateQueries(["projectTasks", projectId]);
    },
  });
};
