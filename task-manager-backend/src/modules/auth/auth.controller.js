// src/modules/auth/auth.controller.js
import asyncHandler from "../../core/middlewares/asyncHandler.js";
import ApiError from "../../core/errors/ApiError.js";
import { authService } from "./auth.service.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";

const COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || "refreshToken";
const COOKIE_PATH = "/api/v1/auth";
const COOKIE_MAX_AGE =
  Number(process.env.REFRESH_COOKIE_MAXAGE) ||
  7 * 24 * 60 * 60 * 1000;

// ⚠️ Cookie policy: dev-safe + prod-safe
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: COOKIE_PATH,
  maxAge: COOKIE_MAX_AGE,
};

export const authController = {
  // ---------------- REGISTER ----------------
  register: asyncHandler(async (req, res) => {
    const parsed = registerSchema.parse(req.body);
    const user = await authService.register(parsed);

    res.status(201).json({
      success: true,
      data: user,
    });
  }),

  // ---------------- LOGIN ----------------
  login: asyncHandler(async (req, res) => {
    const parsed = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } =
      await authService.login(parsed);

    // 🔐 HttpOnly refresh cookie
    res.cookie(COOKIE_NAME, refreshToken, cookieOptions);

    res.json({
      success: true,
      data: {
        user,
        accessToken,
      },
    });
  }),

  // ---------------- REFRESH ----------------
  refresh: asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.[COOKIE_NAME];
    if (!refreshToken) {
      throw new ApiError("UNAUTHORIZED", "Refresh token missing", 401);
    }

    const { accessToken, refreshToken: rotatedRT } =
      await authService.refresh(refreshToken);

    // 🔁 Rotate cookie
    res.cookie(COOKIE_NAME, rotatedRT, cookieOptions);

    res.json({
      success: true,
      data: { accessToken },
    });
  }),

  // ---------------- LOGOUT ----------------
  logout: asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.[COOKIE_NAME];

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie(COOKIE_NAME, {
      ...cookieOptions,
      maxAge: 0,
    });

    res.json({
      success: true,
      data: null,
    });
  }),
};
