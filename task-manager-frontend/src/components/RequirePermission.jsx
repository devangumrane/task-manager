import { Navigate } from "react-router-dom";
import { ROUTES } from "../router/paths";
import { usePermissions } from "../hooks/usePermissions";

export default function RequirePermission({ workspace, permission, children }) {
  const { can } = usePermissions(workspace);

  if (!can(permission)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}
