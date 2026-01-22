import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTaskAttachments,
  uploadAttachment,
  deleteAttachment,
} from "../services/attachmentService";

export const useAttachments = (wsId, pId, taskId) => {
  return useQuery({
    queryKey: ["taskAttachments", wsId, pId, taskId],
    queryFn: () => getTaskAttachments(wsId, pId, taskId),
    enabled: !!wsId && !!pId && !!taskId,
  });
};

export const useUploadAttachment = (wsId, pId, taskId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file) => uploadAttachment(wsId, pId, taskId, file),
    onSuccess: () => {
      qc.invalidateQueries(["taskAttachments", wsId, pId, taskId]);
    },
  });
};

export const useDeleteAttachment = (wsId, pId, taskId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId) =>
      deleteAttachment(wsId, pId, taskId, attachmentId),
    onSuccess: () => {
      qc.invalidateQueries(["taskAttachments", wsId, pId, taskId]);
    },
  });
};
