import { Workspace } from "../../models/index.js";
import ApiError from "../errors/ApiError.js";

export const workspaceOwnerGuard = async (req, res, next) => {
  try {
    const workspaceId = Number(req.params.workspaceId);
    const userId = req.user.id;

    const workspace = await Workspace.findByPk(workspaceId);

    if (!workspace) {
      throw new ApiError("WORKSPACE_NOT_FOUND", "Workspace not found", 404);
    }

    if (workspace.owner_id !== userId) {
      throw new ApiError(
        "FORBIDDEN",
        "Only the workspace owner can perform this action",
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
