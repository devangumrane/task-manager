import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

const fetchSubTasks = async (workspaceId, projectId, taskId) => {
    const res = await api.get(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks`
    );
    return res.data.data;
};

const createSubTask = async ({ workspaceId, projectId, taskId, title }) => {
    const res = await api.post(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks`,
        { title }
    );
    return res.data.data;
};

const updateSubTask = async ({ workspaceId, projectId, taskId, subtaskId, updates }) => {
    const res = await api.patch(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}`,
        updates
    );
    return res.data.data;
};

const deleteSubTask = async ({ workspaceId, projectId, taskId, subtaskId }) => {
    const res = await api.delete(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}`
    );
    return res.data;
};

export const useSubTasks = (workspaceId, projectId, taskId) => {
    const queryClient = useQueryClient();
    const queryKey = ["subtasks", workspaceId, projectId, taskId];

    const { data: subtasks, isLoading } = useQuery({
        queryKey,
        queryFn: () => fetchSubTasks(workspaceId, projectId, taskId),
        enabled: !!taskId,
    });

    const createMutation = useMutation({
        mutationFn: (title) => createSubTask({ workspaceId, projectId, taskId, title }),
        onSuccess: () => {
            queryClient.invalidateQueries(queryKey);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ subtaskId, updates }) => updateSubTask({ workspaceId, projectId, taskId, subtaskId, updates }),
        onSuccess: () => {
            queryClient.invalidateQueries(queryKey);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (subtaskId) => deleteSubTask({ workspaceId, projectId, taskId, subtaskId }),
        onSuccess: () => {
            queryClient.invalidateQueries(queryKey);
        },
    });

    return {
        subtasks,
        isLoading,
        createSubTask: createMutation,
        updateSubTask: updateMutation,
        deleteSubTask: deleteMutation,
    };
};
