import { useQuery } from "@tanstack/react-query";
import { getActivity } from "../services/activityService";
import { useAuthStore } from "../store/authStore";

export const useActivityFeed = (workspaceId) => {
  const { accessToken, isBootstrapped } = useAuthStore();

  return useQuery({
    queryKey: ["workspaceActivity", workspaceId],
    queryFn: () => getActivity(workspaceId),
    enabled: !!workspaceId && !!accessToken && isBootstrapped,
  });
};
