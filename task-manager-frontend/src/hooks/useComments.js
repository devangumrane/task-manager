import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

const fetchComments = async (workspaceId, projectId, taskId) => {
    const res = await api.get(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`
    );
    return res.data;
};

const createComment = async ({ workspaceId, projectId, taskId, content }) => {
    const res = await api.post(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`,
        { content }
    );
    return res.data;
};

const deleteComment = async ({ workspaceId, projectId, taskId, commentId }) => {
    const res = await api.delete(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`
    );
    return res.data;
};

export const useComments = (workspaceId, projectId, taskId) => {
    const queryClient = useQueryClient();
    const queryKey = ["comments", workspaceId, projectId, taskId];

    const { data: comments, isLoading } = useQuery({
        queryKey,
        queryFn: () => fetchComments(workspaceId, projectId, taskId),
        enabled: !!taskId,
    });

    const createMutation = useMutation({
        mutationFn: (content) => createComment({ workspaceId, projectId, taskId, content }),
        onSuccess: () => {
            queryClient.invalidateQueries(queryKey);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (commentId) => deleteComment({ workspaceId, projectId, taskId, commentId }),
        onSuccess: () => {
            queryClient.invalidateQueries(queryKey);
        },
    });

    return {
        comments,
        isLoading,
        createComment: createMutation,
        deleteComment: deleteMutation,
    };
};
