import api from "./api";

export const getReminders = async (workspaceId, projectId, taskId) => {
  const res = await api.get(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/reminders`
  );
  return res.data.data;
};

export const createReminder = async (workspaceId, projectId, taskId, payload) => {
  // payload: { reminderTime: ISOString, note: string }
  const res = await api.post(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/reminders`,
    payload
  );
  return res.data.data;
};

export const deleteReminder = async (workspaceId, projectId, taskId, reminderId) => {
  const res = await api.delete(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/reminders/${reminderId}`
  );
  return res.data.data;
};
