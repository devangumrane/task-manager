export function getWorkspaceRole(workspace, userId) {
  if (!workspace || !userId) return null;

  const member = workspace.members?.find(
    (m) => m.userId === userId
  );

  return member?.role ?? null;
}
