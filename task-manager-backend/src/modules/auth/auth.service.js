// src/modules/auth/auth.service.js
import { User, RefreshToken } from "../../models/index.js";
import { hashPassword, comparePassword } from "../../core/utils/hash.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../core/utils/jwt.js";
import ApiError from "../../core/errors/ApiError.js";
import sequelize from "../../config/database.js";

function safeUser(user) {
  const u = user.toJSON();
  delete u.password_hash;
  delete u.otp_secret;
  return u;
}

function parseDurationMs(spec = "7d") {
  if (/^\d+$/.test(spec)) return Number(spec);
  const m = spec.match(/^(\d+)([smhd])$/);
  if (!m) return 0;
  const v = Number(m[1]);
  const u = m[2];
  switch (u) {
    case "s": return v * 1000;
    case "m": return v * 60 * 1000;
    case "h": return v * 60 * 60 * 1000;
    case "d": return v * 24 * 60 * 60 * 1000;
    default: return 0;
  }
}

export const authService = {
  async register({ name, email, password }) {
    if (!email || !password)
      throw new ApiError("INVALID_INPUT", "Email and password are required", 400);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ApiError("USER_EXISTS", "Email already in use", 409);
    }

    const hashed = await hashPassword(password);
    const user = await User.create({
      username: name || email.split('@')[0],
      email,
      password_hash: hashed
    });

    return safeUser(user);
  },

  async login({ email, password }) {
    if (!email || !password)
      throw new ApiError("INVALID_INPUT", "Email and password are required", 400);

    const user = await User.findOne({ where: { email } });
    if (!user)
      throw new ApiError("INVALID_CREDENTIALS", "Invalid credentials", 401);

    const ok = await comparePassword(password, user.password_hash);
    if (!ok)
      throw new ApiError("INVALID_CREDENTIALS", "Invalid credentials", 401);

    const payload = { userId: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const expiresAt = new Date(
      Date.now() + parseDurationMs(process.env.REFRESH_TOKEN_EXPIRES_IN || "7d")
    );

    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    return {
      user: safeUser(user),
      accessToken,
      refreshToken,
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

    const stored = await RefreshToken.findOne({ where: { token: refreshToken } });
    if (!stored)
      throw new ApiError("INVALID_TOKEN", "Refresh token revoked or not found", 401);

    const newPayload = { userId: payload.userId, email: payload.email };
    const accessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    // Transactional rotation
    await sequelize.transaction(async (t) => {
      await RefreshToken.destroy({ where: { token: refreshToken }, transaction: t });
      await RefreshToken.create({
        userId: payload.userId,
        token: newRefreshToken,
        expiresAt: new Date(
          Date.now() + parseDurationMs(process.env.REFRESH_TOKEN_EXPIRES_IN || "7d")
        ),
      }, { transaction: t });
    });

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken) {
    if (!refreshToken)
      throw new ApiError("INVALID_INPUT", "refreshToken is required", 400);

    await RefreshToken.destroy({ where: { token: refreshToken } });
    return true;
  },

  async getUserById(id) {
    return User.findByPk(id);
  },
};
