// src/core/middlewares/auth.middleware.js
import { verifyAccessToken } from "../utils/jwt.js";
import prisma from "../database/prisma.js";
import ApiError from "../errors/ApiError.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    // -----------------------------------------------------
    // 1. Validate Authorization header
    // -----------------------------------------------------
    if (!header) {
      return next(new ApiError("NO_TOKEN", "Authorization header missing", 401));
    }

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return next(new ApiError("INVALID_AUTH_HEADER", "Invalid Authorization format", 401));
    }

    // -----------------------------------------------------
    // 2. Verify token (detect expired vs invalid)
    // -----------------------------------------------------
    let payload;
    try {
      payload = verifyAccessToken(token); // may throw TokenExpiredError
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new ApiError("TOKEN_EXPIRED", "Access token expired", 401));
      }
      return next(new ApiError("INVALID_TOKEN", "Invalid access token", 401));
    }

    // -----------------------------------------------------
    // 3. Fetch user (ensures user still exists)
    // -----------------------------------------------------
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, profileImage: true },
    });

    if (!user) {
      return next(new ApiError("USER_NOT_FOUND", "User not found", 401));
    }

    // Attach to request for downstream controllers
    req.user = user;

    // Continue request lifecycle
    next();
  } catch (err) {
    return next(err);
  }
}
