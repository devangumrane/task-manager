export default class ApiError extends Error {
  /**
   * @param {string} code - machine-readable error code (e.g. INVALID_INPUT)
   * @param {string} message - human-readable message
   * @param {number} status - HTTP status code
   * @param {object} [details] - optional extra info
   */
  constructor(code, message, status = 500, details = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code || "INTERNAL_ERROR";
    this.status = status || 500;
    this.details = details || {};
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}
