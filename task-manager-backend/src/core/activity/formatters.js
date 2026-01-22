import { EVENTS } from "../realtime/events.js";

/**
 * ActivityFormatter
 * - Normalizes event metadata into UI-ready activity log entries.
 * - Uses EVENTS registry (title, icon, optional format(meta)).
 * - Always returns: { title, icon, details }
 */
export const ActivityFormatter = {
  format(type, meta = {}) {
    const def = EVENTS[type];

    // Event exists in registry → use mapped title/icon
    if (def) {
      const title = def.title || type;
      const icon = def.icon || "info";

      // If event defines its own formatter, call it
      const details =
        typeof def.format === "function"
          ? def.format(meta)
          : meta;

      return { title, icon, details };
    }

    // Unknown event → gracefully fallback
    return {
      title: type,
      icon: "info",
      details: meta,
    };
  },
};
