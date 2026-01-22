// src/core/utils/roles.js
export const ROLE_ORDER = ["member", "admin"];

export function roleSatisfies(userRole, requiredRole) {
  const u = ROLE_ORDER.indexOf(userRole);
  const r = ROLE_ORDER.indexOf(requiredRole);
  if (u === -1 || r === -1) return false;
  return u >= r;
}
