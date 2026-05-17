// ============================================================
// middleware/errorHandler.js
// Global error handler — catches any unhandled errors thrown
// anywhere in the app and returns a consistent JSON response.
// ============================================================

const errorHandler = (err, req, res, next) => {
  // Log the full error stack in development for debugging
  if (process.env.NODE_ENV !== "production") {
    console.error("❌ Error:", err.stack);
  }

  // Default to 500 Internal Server Error
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only expose stack trace in development
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
