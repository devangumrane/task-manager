import { verifyAccessToken } from "../utils/jwt.js";
import { User } from "../../models/index.js";

export const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    // "Bearer <token>"
    const cleanToken = token.replace("Bearer ", "");
    const decoded = verifyAccessToken(cleanToken);

    if (!decoded) {
      return next(new Error("Authentication error"));
    }

    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'username', 'email']
    });

    if (!user) {
      return next(new Error("Authentication error"));
    }

    // Attach user to socket
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
};
