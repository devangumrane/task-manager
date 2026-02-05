import api from "./api";

export const getTaskAttachments = async (workspaceId, projectId, taskId) => {
  const res = await api.get(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments`
  );
  return res.data;
};

export const uploadAttachment = async (workspaceId, projectId, taskId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments`,
    formData
  );

  return res.data;
};

export const deleteAttachment = async (workspaceId, projectId, taskId, attachmentId) => {
  const res = await api.delete(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`
  );
  return res.data;
};
