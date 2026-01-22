
import prisma from "../database/prisma.js";
import ApiError from "../errors/ApiError.js";

/**
 * Role precedence helper.
 * Higher index => more privileges.
 */
const ROLE_ORDER = ["member", "admin"];

/**
 * returns true if userRole satisfies requiredRole (or higher)
 */
function roleSatisfies(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false;
  const u = ROLE_ORDER.indexOf(userRole);
  const r = ROLE_ORDER.indexOf(requiredRole);
  if (u === -1 || r === -1) return false;
  return u >= r;
}

/**
 * workspaceRoleGuard(requiredRole)
 * - requiredRole: "admin" | "member"
 *
 * Behavior:
 *  - ownerId on workspace => treated as admin
 *  - checks workspaceMember table otherwise
 *  - attaches req.workspaceRole = '<role>'
 */
export function workspaceRoleGuard(requiredRole = "member") {
  return async function (req, res, next) {
    try {
      const workspaceId = Number(req.params.workspaceId || req.params.id);
      if (!workspaceId) {
        throw new ApiError("INVALID_WORKSPACE_ID", "Invalid workspace ID", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError("UNAUTHENTICATED", "User not authenticated", 401);
      }

      // 1) quick fetch workspace owner
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true },
      });

      if (!workspace) {
        throw new ApiError("WORKSPACE_NOT_FOUND", "Workspace not found", 404);
      }

      // owner gets admin rights
      if (workspace.ownerId === userId) {
        req.workspaceRole = "admin";
        return next();
      }

      // 2) check membership
      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
        select: { role: true },
      });

      if (!member) {
        throw new ApiError("ACCESS_DENIED", "Not a workspace member", 403);
      }

      req.workspaceRole = member.role;

      // 3) role check
      if (!roleSatisfies(member.role, requiredRole)) {
        throw new ApiError("FORBIDDEN", "Insufficient workspace role", 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
