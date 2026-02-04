// src/core/middlewares/auth.middleware.js
import { verifyAccessToken } from "../utils/jwt.js";
import { User } from "../../models/index.js";
import ApiError from "../errors/ApiError.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return next(new ApiError("NO_TOKEN", "Authorization header missing", 401));
    }

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return next(new ApiError("INVALID_AUTH_HEADER", "Invalid Authorization format", 401));
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new ApiError("TOKEN_EXPIRED", "Access token expired", 401));
      }
      return next(new ApiError("INVALID_TOKEN", "Invalid access token", 401));
    }

    const user = await User.findByPk(payload.userId, {
      attributes: ['id', 'email', 'username', 'profile_image']
    });

    if (!user) {
      return next(new ApiError("USER_NOT_FOUND", "User not found", 401));
    }

    req.user = user.toJSON();
    next();
  } catch (err) {
    return next(err);
  }
}
