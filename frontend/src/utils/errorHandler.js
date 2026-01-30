/**
 * Standardized Error Handling Utility
 * Provides consistent error handling patterns across the application
 */

import toast from 'react-hot-toast';

/**
 * Application Error class for operational errors
 */
export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Error codes for common scenarios
 */
export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * User-friendly error messages
 */
const userMessages = {
  [ErrorCodes.NETWORK_ERROR]: 'Unable to connect. Please check your internet connection.',
  [ErrorCodes.UNAUTHORIZED]: 'Your session has expired. Please log in again.',
  [ErrorCodes.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCodes.SERVER_ERROR]: 'Something went wrong on our end. Please try again later.',
  [ErrorCodes.TIMEOUT]: 'The request timed out. Please try again.',
  [ErrorCodes.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

/**
 * Get user-friendly message for an error code
 */
export const getUserMessage = (code) => {
  return userMessages[code] || userMessages[ErrorCodes.UNKNOWN];
};

/**
 * Map HTTP status codes to error codes
 */
const mapStatusToCode = (status) => {
  if (status === 0) return ErrorCodes.NETWORK_ERROR;
  if (status === 401) return ErrorCodes.UNAUTHORIZED;
  if (status === 403) return ErrorCodes.FORBIDDEN;
  if (status === 404) return ErrorCodes.NOT_FOUND;
  if (status >= 400 && status < 500) return ErrorCodes.VALIDATION_ERROR;
  if (status >= 500) return ErrorCodes.SERVER_ERROR;
  return ErrorCodes.UNKNOWN;
};

/**
 * Log error for debugging (can be extended to send to error tracking service)
 */
const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    code: error.code || 'UNKNOWN',
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context,
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Handler]', errorInfo);
  }

  // TODO: In production, send to error tracking service (Sentry, LogRocket, etc.)
  // Example: Sentry.captureException(error, { extra: context });
};

/**
 * Main error handler function
 * @param {Error} error - The error object
 * @param {Object} options - Handler options
 * @param {string} options.userMessage - Custom message to show user
 * @param {boolean} options.showToast - Whether to show a toast notification (default: true)
 * @param {string} options.toastType - Type of toast ('error' | 'warning') (default: 'error')
 * @param {Object} options.context - Additional context for logging
 * @returns {Object} - Normalized error object
 */
export const handleError = (error, options = {}) => {
  const {
    userMessage,
    showToast = true,
    toastType = 'error',
    context = {},
  } = options;

  // Normalize the error
  let normalizedError;
  
  if (error instanceof AppError) {
    normalizedError = error;
  } else if (error.isApiError) {
    // Handle API errors from our API service
    const code = mapStatusToCode(error.status);
    normalizedError = new AppError(error.message, code, error.status);
  } else if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
    normalizedError = new AppError('Network error', ErrorCodes.NETWORK_ERROR, 0);
  } else {
    normalizedError = new AppError(
      error.message || 'An unexpected error occurred',
      ErrorCodes.UNKNOWN
    );
  }

  // Log the error
  logError(normalizedError, context);

  // Show toast notification
  if (showToast) {
    const message = userMessage || getUserMessage(normalizedError.code);
    if (toastType === 'warning') {
      toast(message, { icon: '⚠️' });
    } else {
      toast.error(message);
    }
  }

  return normalizedError;
};

/**
 * Async error handler wrapper for try/catch blocks
 * @param {Function} fn - Async function to wrap
 * @param {Object} options - Error handler options
 * @returns {Function} - Wrapped function
 */
export const withErrorHandler = (fn, options = {}) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, options);
      throw error; // Re-throw for calling code to handle if needed
    }
  };
};

/**
 * Safe async function executor that catches errors
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Error handler options
 * @returns {Promise<[Error | null, any]>} - Tuple of [error, result]
 */
export const safeAsync = async (fn, options = {}) => {
  try {
    const result = await fn();
    return [null, result];
  } catch (error) {
    handleError(error, options);
    return [error, null];
  }
};

export default handleError;
