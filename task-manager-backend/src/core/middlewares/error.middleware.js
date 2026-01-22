import ApiError from "../errors/ApiError.js";

/**
 * Centralized error middleware.
 * Produces this JSON shape:
 * {
 *   success: false,
 *   error: { code, message, details }
 * }
 */
export default function errorMiddleware(err, req, res, next) {
  // If it's already an ApiError — honor it
  if (err instanceof ApiError) {
    return res.status(err.status).json(err.toJSON());
  }

  // Handle known types (Prisma, multer, validation libraries) gracefully:

  // Prisma unique constraint -> 409
  if (err?.code === "P2002") {
    const apiErr = new ApiError(
      "CONFLICT",
      "Resource conflict (unique constraint)",
      409,
      { meta: err.meta || null }
    );
    return res.status(apiErr.status).json(apiErr.toJSON());
  }

  // Multer file size & type errors
  if (err?.code === "LIMIT_FILE_SIZE" || /file too large/i.test(err?.message || "")) {
    const apiErr = new ApiError("FILE_TOO_LARGE", "Uploaded file is too large", 413);
    return res.status(apiErr.status).json(apiErr.toJSON());
  }

  if (/invalid file type/i.test(err?.message || "")) {
    const apiErr = new ApiError("INVALID_FILE_TYPE", err.message, 400);
    return res.status(apiErr.status).json(apiErr.toJSON());
  }

  // Zod-like validation errors
  if (err?.issues && Array.isArray(err.issues)) {
    // Zod v3 uses error.issues
    const details = err.issues.map((i) => ({
      path: i.path,
      message: i.message,
    }));
    const apiErr = new ApiError("INVALID_INPUT", "Validation failed", 400, { details });
    return res.status(apiErr.status).json(apiErr.toJSON());
  }

  // Generic express-validator / custom validation shape
  if (err?.errors && Array.isArray(err.errors)) {
    const details = err.errors.map((e) => ({
      path: e.param || e.path,
      message: e.msg || e.message,
    }));
    const apiErr = new ApiError("INVALID_INPUT", "Validation failed", 400, { details });
    return res.status(apiErr.status).json(apiErr.toJSON());
  }

  // Fallback - do not leak stack in production
  const isProd = process.env.NODE_ENV === "production";
  const fallback = new ApiError(
    err?.code || "INTERNAL_ERROR",
    err?.message || "Internal server error",
    err?.status || 500,
    isProd ? {} : { stack: err?.stack }
  );

  // Log the original error for ops/debug
  // eslint-disable-next-line no-console
  console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err);

  return res.status(fallback.status).json(fallback.toJSON());
}
