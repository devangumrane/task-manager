import api from "./api";

export const listReminders = async (wsId, pId, taskId) => {
  const res = await api.get(
    `/workspaces/${wsId}/projects/${pId}/tasks/${taskId}/reminders`
  );
  return res.data;
};

export const createReminder = async (wsId, pId, taskId, payload) => {
  const res = await api.post(
    `/workspaces/${wsId}/projects/${pId}/tasks/${taskId}/reminders`,
    payload
  );
  return res.data;
};

export const deleteReminder = async (wsId, pId, taskId, reminderId) => {
  const res = await api.delete(
    `/workspaces/${wsId}/projects/${pId}/tasks/${taskId}/reminders/${reminderId}`
  );
  return res.data;
};
