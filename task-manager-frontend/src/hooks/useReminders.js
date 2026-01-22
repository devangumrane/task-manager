import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listReminders,
  createReminder,
  deleteReminder,
} from "../services/reminderService";

export const useReminders = (wsId, pId, taskId) => {
  return useQuery({
    queryKey: ["taskReminders", wsId, pId, taskId],
    queryFn: () => listReminders(wsId, pId, taskId),
    enabled: !!wsId && !!pId && !!taskId,
  });
};

export const useCreateReminder = (wsId, pId, taskId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createReminder(wsId, pId, taskId, payload),
    onSuccess: () => {
      qc.invalidateQueries(["taskReminders", wsId, pId, taskId]);
    },
  });
};

export const useDeleteReminder = (wsId, pId, taskId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reminderId) => deleteReminder(wsId, pId, taskId, reminderId),
    onSuccess: () => {
      qc.invalidateQueries(["taskReminders", wsId, pId, taskId]);
    },
  });
};
