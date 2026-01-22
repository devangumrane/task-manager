import { ROLE_PERMISSIONS } from "../auth/permissions";
import { getWorkspaceRole } from "../auth/getWorkspaceRole";
import { useAuthStore } from "../store/authStore";

export function usePermissions(workspace) {
  const user = useAuthStore((s) => s.user);

  const role = getWorkspaceRole(workspace, user?.id);

  const can = (permission) => {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(permission);
  };

  return {
    role,
    can,
  };
}
