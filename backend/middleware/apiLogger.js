import ApiLog from '../models/ApiLog.js';

// Fields to remove from logged data
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'secret',
  'authorization',
  'api_key',
  'accessToken',
  'refreshToken',
  'confirmPassword',
];

// Maximum body size to log (10KB)
const MAX_BODY_SIZE = 10 * 1024;

// Slow request threshold (1000ms)
const SLOW_THRESHOLD = 1000;

/**
 * Sanitize an object by removing sensitive fields
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Sanitize headers by removing sensitive ones
 */
const sanitizeHeaders = (headers) => {
  if (!headers) return {};

  const sanitized = { ...headers };
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];

  for (const header of sensitiveHeaders) {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  }

  return sanitized;
};

/**
 * Truncate large bodies
 */
const truncateBody = (body) => {
  if (!body) return null;

  const stringified = typeof body === 'string' ? body : JSON.stringify(body);

  if (stringified.length > MAX_BODY_SIZE) {
    return {
      _truncated: true,
      _originalSize: stringified.length,
      _preview: stringified.substring(0, 1000) + '...[TRUNCATED]',
    };
  }

  return typeof body === 'string' ? body : sanitizeObject(body);
};

/**
 * Get client IP address
 */
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

/**
 * API Logger Middleware
 * Captures all HTTP requests and responses for monitoring and debugging
 */
const apiLogger = (req, res, next) => {
  // Skip logging for health check endpoints
  if (req.path === '/health' || req.path === '/') {
    return next();
  }

  const startTime = Date.now();

  // Capture original response methods
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  let responseBody = null;

  // Override res.json to capture response body
  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };

  // Override res.send to capture response body
  res.send = (body) => {
    if (typeof body === 'string') {
      try {
        responseBody = JSON.parse(body);
      } catch {
        responseBody = body;
      }
    } else {
      responseBody = body;
    }
    return originalSend(body);
  };

  // Log when response finishes
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Use setImmediate for non-blocking async logging
    setImmediate(async () => {
      try {
        const logData = {
          timestamp: new Date(),
          method: req.method,
          path: req.originalUrl || req.url,
          statusCode,
          responseTime,
          userId: req.user?._id || null,
          userEmail: req.user?.email || null,
          ipAddress: getClientIp(req),
          userAgent: req.headers['user-agent'] || null,
          requestHeaders: sanitizeHeaders(req.headers),
          requestBody: truncateBody(sanitizeObject(req.body)),
          queryParams: sanitizeObject(req.query),
          responseBody: truncateBody(responseBody),
          errorMessage: statusCode >= 400 ? responseBody?.message || null : null,
          errorStack: null,
          isSlow: responseTime > SLOW_THRESHOLD,
          isError: statusCode >= 400,
        };

        await ApiLog.create(logData);
      } catch (error) {
        // Log error but don't crash the app
        console.error('[API Logger] Failed to save log:', error.message);
      }
    });
  });

  next();
};

export default apiLogger;
