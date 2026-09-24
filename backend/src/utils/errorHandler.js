const { ZodError } = require('zod');
const logger = require('./logger');

function errorHandler(err, req, res, next) {
  logger.error(`Error processing ${req.method} ${req.originalUrl}:`, err.message || err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred on the server',
  });
}

module.exports = errorHandler;
