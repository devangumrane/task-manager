import prisma from "../database/prisma.js";
import ApiError from "../errors/ApiError.js";

export const workspaceOwnerGuard = async (req, res, next) => {
  try {
    const workspaceId = Number(req.params.workspaceId);
    const userId = req.user.id;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new ApiError("WORKSPACE_NOT_FOUND", "Workspace not found", 404);
    }

    if (workspace.ownerId !== userId) {
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
