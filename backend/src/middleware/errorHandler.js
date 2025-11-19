/**
 * Centralized error handling for Together API
 * Provides consistent error response format
 */

/**
 * Format error response consistently
 * @param {string} message - User-friendly error message
 * @param {string} code - Error code (e.g., 'VALIDATION_ERROR', 'AUTH_ERROR')
 * @param {number} statusCode - HTTP status code
 * @param {Array} details - Additional error details (optional)
 */
const formatErrorResponse = (message, code = 'ERROR', statusCode = 500, details = null) => {
  return {
    error: {
      message,
      code,
      ...(details && { details })
    }
  };
};

/**
 * Error handler middleware
 * Must be the last middleware in app.js
 * Usage: app.use(errorHandler)
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json(formatErrorResponse(
      'Validation failed',
      'VALIDATION_ERROR',
      400,
      messages
    ));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json(formatErrorResponse(
      `${field} already exists`,
      'DUPLICATE_ERROR',
      400
    ));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(formatErrorResponse(
      'Invalid token',
      'AUTH_ERROR',
      401
    ));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(formatErrorResponse(
      'Token expired',
      'AUTH_ERROR',
      401
    ));
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(statusCode).json(formatErrorResponse(message, code, statusCode));
};

/**
 * Create a custom error class
 * Usage: throw new AppError('Not found', 'NOT_FOUND', 404)
 */
class AppError extends Error {
  constructor(message, code = 'ERROR', statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wrapper for async route handlers to catch errors automatically
 * Usage: router.post('/endpoint', catchAsync(async (req, res) => { ... }))
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  formatErrorResponse,
  errorHandler,
  AppError,
  catchAsync
};
