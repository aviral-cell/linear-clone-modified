import ApiLog from '../models/ApiLog.js';
import {
  SLOW_THRESHOLD,
  sanitizeObject,
  sanitizeHeaders,
  truncateBody,
  getClientIp,
} from '../utils/apiLoggerUtils.js';

const apiLogger = (req, res, next) => {
  if (req.path === '/health' || req.path === '/') {
    return next();
  }

  const startTime = Date.now();

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  let responseBody = null;

  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };

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

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;

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
          errorMessage: statusCode >= 400 ? responseBody?.message || responseBody?.error || null : null,
          errorStack: null,
          isSlow: responseTime > SLOW_THRESHOLD,
          isError: statusCode >= 400,
        };

        await ApiLog.create(logData);
      } catch (error) {
        console.error('[API Logger] Failed to save log:', error.message);
      }
    });
  });

  next();
};

export default apiLogger;
