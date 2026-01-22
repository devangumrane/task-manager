# Socket Events Contract — Task Manager Backend

## General rules
- All realtime events are delivered via Socket.IO.
- Clients must authenticate via JWT in handshake `auth.token`.
- Server-side rooms:
  - `workspace:<workspaceId>` — workspace-level broadcasts
  - `user:<userId>` — direct user sockets (emitted via helper)
- Timestamps are ISO strings unless noted.

---

## Presence
### `presence.online`
- SCOPE: global (or workspace if you prefer); emitted when user first connects
- PAYLOAD:
```json
{ "userId": 123, "time": "2025-01-01T12:00:00Z" }
