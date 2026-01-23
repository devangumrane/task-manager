import ApiError from "../errors/ApiError.js";

/**
 * Middleware to enforce global user roles
 * @param {string} requiredRole - 'admin' | 'mentor' | 'student'
 */
export function requireRole(requiredRole) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError("UNAUTHENTICATED", "Not authenticated", 401));
        }

        const { role } = req.user; // "student", "mentor", "admin"

        // Admin has access to everything
        if (role === "admin") return next();

        // Check specific requirements
        if (requiredRole === "admin" && role !== "admin") {
            return next(new ApiError("FORBIDDEN", "Admin access required", 403));
        }

        if (requiredRole === "mentor" && role !== "mentor") {
            return next(new ApiError("FORBIDDEN", "Mentor access required", 403));
        }

        next();
    };
}
