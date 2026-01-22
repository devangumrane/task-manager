// userId -> Set(socketIds)
const userSockets = new Map();

export const socketState = {
  registerConnection(userId, socketId) {
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socketId);
  },

  unregisterConnection(userId, socketId) {
    if (!userSockets.has(userId)) return false;

    const set = userSockets.get(userId);
    set.delete(socketId);

    if (set.size === 0) {
      userSockets.delete(userId);
      return false; // user offline
    }
    return true; // user still has active sockets
  },

  getUserSockets(userId) {
    return userSockets.get(userId) || new Set();
  }
};
