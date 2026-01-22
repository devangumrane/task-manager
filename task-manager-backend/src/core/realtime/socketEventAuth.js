// src/core/realtime/socketEventAuth.js
import { EVENTS } from "./events.js";
import prisma from "../database/prisma.js";

/**
 * socketEventAuth
 * Middleware that applies to EVERY socket event:
 * - Ensures event is known & whitelisted
 * - Ensures user has proper RBAC role for the event
 * - Resolves workspaceId from packet payload for RBAC checks
 *
 * IMPORTANT:
 * This does NOT block "workspace.join" or "workspace.leave".
 * Those are intentionally open (auth-only).
 */

export async function socketEventAuth(socket, packet, next) {
  try {
    const [event, payload] = packet;

    // -------------------------------------------------------
    // 0. Allow join/leave events to pass without RBAC
    // -------------------------------------------------------
    if (event === "workspace.join" || event === "workspace.leave") {
      return next();
    }

    // -------------------------------------------------------
    // 1. Validate event is known
    // -------------------------------------------------------
    const eventDef = EVENTS[event];
    if (!eventDef) {
      console.warn(`⚠ Blocked unknown socket event: ${event}`);
      return next({
        code: "UNKNOWN_EVENT",
        message: `Event '${event}' is not allowed`,
      });
    }

    // If event has NO requiredRole => allow
    if (!eventDef.requiredRole) return next();

    // -------------------------------------------------------
    // 2. Resolve workspaceId for RBAC checks
    // -------------------------------------------------------
    // We support multiple metadata styles:
    // { workspaceId }
    // { meta: { workspaceId } }
    // { task: {...}, ... } will NOT work (RBAC must be explicit)
    let workspaceId =
      payload?.workspaceId ||
      payload?.meta?.workspaceId ||
      payload?.task?.workspaceId ||
      payload?.project?.workspaceId ||
      null;

    workspaceId = Number(workspaceId);

    if (!workspaceId) {
      console.warn(
        `⚠ Missing workspaceId for event '${event}'. Payload:`,
        payload
      );
      return next({
        code: "WORKSPACE_ID_REQUIRED",
        message: `workspaceId required for event '${event}'`,
      });
    }

    // -------------------------------------------------------
    // 3. Check cached role (fast path)
    // -------------------------------------------------------
    let role = socket.roles.workspaces[workspaceId];

    // If not cached → fetch from DB
    if (!role) {
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: socket.user.id,
          },
        },
        select: { role: true },
      });

      if (!membership) {
        return next({
          code: "NOT_A_MEMBER",
          message: "You are not a member of this workspace",
        });
      }

      role = membership.role;
      socket.roles.workspaces[workspaceId] = role; // cache
    }

    // -------------------------------------------------------
    // 4. RBAC enforcement (admin > member)
    // -------------------------------------------------------
    const required = eventDef.requiredRole;

    const hierarchy = { member: 1, admin: 2 };

    if (hierarchy[role] < hierarchy[required]) {
      console.warn(
        `⚠ Unauthorized event '${event}' by user ${socket.user.id}. Required: ${required}, Has: ${role}`
      );
      return next({
        code: "FORBIDDEN",
        message: `You do not have permission to emit '${event}'`,
      });
    }

    // -------------------------------------------------------
    // 5. Event authorized → proceed
    // -------------------------------------------------------
    return next();
  } catch (err) {
    console.error("socketEventAuth fatal error:", err);
    return next({
      code: "SOCKET_EVENT_AUTH_ERROR",
      message: err.message || "Event authorization failed",
    });
  }
}
