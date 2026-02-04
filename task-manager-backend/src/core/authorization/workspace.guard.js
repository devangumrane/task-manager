import { WorkspaceMember } from "../../models/index.js";
import ApiError from "../errors/ApiError.js";

export async function assertWorkspaceMember(tx, userId, workspaceId) {
  // tx is optional, can be null (Sequelize doesn't restrict read without tx usually, but if provided we use it)
  // Sequelize transaction is passed as { transaction: tx } option.

  const options = {};
  if (tx) options.transaction = tx;

  const member = await WorkspaceMember.findOne({
    where: { user_id: userId, workspace_id: workspaceId },
    ...options
  });

  if (!member) {
    throw new ApiError("FORBIDDEN", "User has no access to this workspace", 403);
  }

  return member;
}
