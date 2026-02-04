import { Workspace, WorkspaceMember } from "../../models/index.js";

export async function workspaceAccessGuard(req, res, next) {
  try {
    const workspaceId = Number(req.params.id || req.params.workspaceId);
    const userId = req.user.id;

    if (!workspaceId) {
      const err = new Error("Workspace ID missing in route params");
      err.status = 400;
      throw err;
    }

    // ---------------------------------------
    // 1. Check if workspace exists
    // ---------------------------------------
    const workspace = await Workspace.findByPk(workspaceId, {
      attributes: ['owner_id'],
    });

    if (!workspace) {
      const err = new Error("Workspace not found");
      err.status = 404;
      throw err;
    }

    // ---------------------------------------
    // 2. If user is owner → full access
    // ---------------------------------------
    if (workspace.owner_id === userId) {
      req.workspaceRole = "admin"; // Owner = top role
      return next();
    }

    // ---------------------------------------
    // 3. Check if user is a workspace member
    // ---------------------------------------
    const member = await WorkspaceMember.findOne({
      where: {
        workspace_id: workspaceId,
        user_id: userId,
      },
      attributes: ['role'],
    });

    if (!member) {
      const err = new Error("Access denied. Not a workspace member.");
      err.status = 403;
      throw err;
    }

    // ---------------------------------------
    // 4. Inject the member's role into request
    // ---------------------------------------
    req.workspaceRole = member.role;

    next();
  } catch (err) {
    next(err);
  }
}
