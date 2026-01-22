// src/core/realtime/emitters.js
import { EVENTS } from "./events.js";

/**
 * Validate event exists in the EVENTS map.
 * Returns the event definition object.
 */
function validateEvent(event) {
  const def = EVENTS[event];
  if (!def) {
    throw new Error(`Unknown event emitted: ${event}`);
  }
  return def;
}

/**
 * Helper to build the canonical payload shape:
 * { entity: {...}, meta: { byUserId } }
 * Accepts either already-normalized or raw payload and normalizes using def.format if present.
 */
function buildPayload(def, payload = {}) {
  // def.format (if provided) returns details or entity; we respect it
  if (def.format && typeof def.format === "function") {
    const formatted = def.format(payload);
    // If format returns { entity, meta } use it; otherwise assume it's entity/details
    if (formatted && (formatted.entity || formatted.meta)) return formatted;
    return { entity: formatted, meta: payload.meta || {} };
  }

  // Default: expect payload already in { entity, meta } or fall back
  if (payload && (payload.entity || payload.meta)) return payload;

  // Fallback: put everything under entity
  return { entity: payload, meta: {} };
}

export function createEmitters(io) {
  return {
    emitToWorkspace(workspaceId, event, payload = {}) {
      const def = validateEvent(event);
      const built = buildPayload(def, payload);

      const room = workspaceId ? `workspace:${workspaceId}` : null;
      if (room) {
        io.to(room).emit(event, built);
      } else {
        io.emit(event, built);
      }
    },

    emitToUser(userId, event, payload = {}) {
      const def = validateEvent(event);
      const built = buildPayload(def, payload);
      io.to(`user:${userId}`).emit(event, built);
    },

    // allow safe direct emit (internal)
    safeEmit(event, target, payload = {}) {
      try {
        if (target?.workspaceId) {
          this.emitToWorkspace(target.workspaceId, event, payload);
        } else if (target?.userId) {
          this.emitToUser(target.userId, event, payload);
        } else {
          const def = validateEvent(event);
          const built = buildPayload(def, payload);
          io.emit(event, built);
        }
      } catch (err) {
        console.error("[safeEmit] failed:", err?.message || err);
      }
    },
  };
}

// export helper for other modules that may want to validate
export function validateEventName(name) {
  return EVENTS[name] ?? null;
}
