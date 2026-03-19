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
const MAX_BODY_SIZE = 10 * 1024;
export const SLOW_THRESHOLD = 1000;

export const sanitizeObject = (obj) => {
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

export const sanitizeHeaders = (headers) => {
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

export const truncateBody = (body) => {
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

export const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
};
