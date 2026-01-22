// src/modules/auth/auth.service.js
import prisma from "../../core/database/prisma.js";
import { hashPassword, comparePassword } from "../../core/utils/hash.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../core/utils/jwt.js";
import ApiError from "../../core/errors/ApiError.js";

function safeUser(user) {
  const { password, ...u } = user;
  return u;
}

function parseDurationMs(spec = "7d") {
  if (/^\d+$/.test(spec)) return Number(spec);
  const m = spec.match(/^(\d+)([smhd])$/);
  if (!m) return 0;
  const v = Number(m[1]);
  const u = m[2];
  switch (u) {
    case "s":
      return v * 1000;
    case "m":
      return v * 60 * 1000;
    case "h":
      return v * 60 * 60 * 1000;
    case "d":
      return v * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}

export const authService = {
  async register({ name, email, password }) {
    if (!email || !password)
      throw new ApiError(
        "INVALID_INPUT",
        "Email and password are required",
        400
      );

    try {
      const hashed = await hashPassword(password);
      const user = await prisma.user.create({
        data: { name: name || null, email, password: hashed },
      });

      return safeUser(user);
    } catch (err) {
      if (err?.code === "P2002") {
        throw new ApiError("USER_EXISTS", "Email already in use", 409);
      }
      throw err;
    }
  },

  async login({ email, password }) {
    if (!email || !password)
      throw new ApiError(
        "INVALID_INPUT",
        "Email and password are required",
        400
      );

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new ApiError("INVALID_CREDENTIALS", "Invalid credentials", 401);

    const ok = await comparePassword(password, user.password);
    if (!ok)
      throw new ApiError("INVALID_CREDENTIALS", "Invalid credentials", 401);

    const payload = { userId: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // persist refresh token (rotate-safe)
    const expiresAt = new Date(
      Date.now() + parseDurationMs(process.env.REFRESH_TOKEN_EXPIRES_IN || "7d")
    );
    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    });

    return {
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
      refreshToken, // sent as cookie
    };
  },

  async refresh(refreshToken) {
    if (!refreshToken)
      throw new ApiError("INVALID_INPUT", "refreshToken is required", 400);

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (e) {
      throw new ApiError("INVALID_TOKEN", "Invalid refresh token", 401);
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!stored)
      throw new ApiError(
        "INVALID_TOKEN",
        "Refresh token revoked or not found",
        401
      );

    const newPayload = { userId: payload.userId, email: payload.email };
    const accessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    // rotate tokens transactionally
    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { token: refreshToken } }),
      prisma.refreshToken.create({
        data: {
          userId: payload.userId,
          token: newRefreshToken,
          expiresAt: new Date(
            Date.now() +
              parseDurationMs(process.env.REFRESH_TOKEN_EXPIRES_IN || "7d")
          ),
        },
      }),
    ]);

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken) {
    if (!refreshToken)
      throw new ApiError("INVALID_INPUT", "refreshToken is required", 400);
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    return true;
  },

  async getUserById(id) {
    return prisma.user.findUnique({ where: { id } });
  },
};
