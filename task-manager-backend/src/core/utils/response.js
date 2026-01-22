// standard API responses
export function success(res, data = null, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function error(res, apiError) {
  // apiError should be instance of ApiError or plain error
  if (apiError && apiError.toJSON) {
    return res.status(apiError.status || 500).json(apiError.toJSON());
  }

  const fallback = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: apiError?.message || "An internal error occurred",
      details: {},
    },
  };

  return res.status(500).json(fallback);
}
