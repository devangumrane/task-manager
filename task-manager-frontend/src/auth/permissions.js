export const ROLE_PERMISSIONS = {
  owner: [
    "workspace:delete",
    "workspace:update",
    "member:add",
    "member:remove",
    "project:create",
    "project:delete",
    "task:create",
    "task:update",
    "task:delete",
  ],

  admin: [
    "workspace:update",
    "member:add",
    "project:create",
    "project:delete",
    "task:create",
    "task:update",
  ],

  member: [
    "project:view",
    "task:create",
    "task:update",
  ],

  viewer: [
    "project:view",
    "task:view",
  ],
};
