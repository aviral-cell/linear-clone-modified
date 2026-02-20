# Workflow (MERN): API Logger

## Overview

Workflow is a project management platform where teams can manage issues, track progress, and collaborate. Currently, there is no visibility into API usage. The API Logs page in the UI is fully implemented and currently renders sample data returned by the backend to demonstrate the expected UI behavior. Your task is to remove the sample data implementation and replace it with an actual API logger that automatically records all HTTP requests made to the server, and provide admin endpoints to serve the logged data with filtering, search, sorting, and pagination.

## Expected API Behavior

All endpoints require Bearer token authentication. Unauthenticated requests return 401. All admin log endpoints additionally require admin role — non-admin users receive 403 with `"Admin access required"`.

**1. Automatic Request Logging** — New

All HTTP requests are automatically logged with the following captured data:

```json
{
  "timestamp": "2024-01-01T10:00:00.000Z",
  "method": "GET",
  "path": "/api/users",
  "statusCode": 200,
  "responseTime": 50,
  "userId": "user_id",
  "userEmail": "user@email.com",
  "ipAddress": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "requestHeaders": {},
  "requestBody": {},
  "queryParams": {},
  "responseBody": {},
  "errorMessage": "",
  "isSlow": false,
  "isError": false
}
```

- `isSlow` is set to `true` when `responseTime` exceeds 1000ms
- `isError` is set to `true` when `statusCode` is 400 or above
- Sensitive fields in request/response bodies are redacted (passwords, tokens, secrets, API keys)
- Authorization and cookie headers are redacted
- Request/response bodies larger than 10KB are truncated
- Logging is asynchronous and does not block the response

---

**2. GET /api/admin/logs** — New

Retrieve API logs with filtering, searching, sorting, and pagination.

Query Parameters (all optional):

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (minimum 1) |
| `limit` | number | 50 | Results per page (1-100) |
| `method` | string | — | Filter by HTTP method (e.g., `POST`, `GET`) |
| `statusCode` | string | — | Filter by status code or range (`2xx`, `3xx`, `4xx`, `5xx`, or exact like `404`) |
| `userId` | string | — | Filter by user ID |
| `startDate` | ISO string | — | Filter logs on or after this date |
| `endDate` | ISO string | — | Filter logs on or before this date |
| `search` | string | — | Search in path, userEmail, and ipAddress (case-insensitive) |
| `isSlow` | string | — | Set to `"true"` to filter slow requests only |
| `isError` | string | — | Set to `"true"` to filter error requests only |
| `sortBy` | string | `timestamp` | Field to sort by (e.g., `timestamp`, `responseTime`) |
| `sortOrder` | string | `desc` | Sort direction: `asc` or `desc` |

Success Response (200):

```json
{
  "logs": [
    {
      "_id": "log_id",
      "timestamp": "2024-01-01T13:00:00.000Z",
      "method": "DELETE",
      "path": "/api/comments/123",
      "statusCode": 500,
      "responseTime": 2000,
      "userEmail": "user@email.com",
      "userId": "user_id",
      "ipAddress": "127.0.0.1",
      "isSlow": true,
      "isError": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalLogs": 100,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Status Code Range Filters:**
- `statusCode=2xx` — matches 200-299
- `statusCode=4xx` — matches 400-499
- `statusCode=5xx` — matches 500+
- `statusCode=404` — matches exact status code

Multiple filters are applied simultaneously with AND logic.

- 403 — `"Admin access required"` — when user is not an admin

---

**3. GET /api/admin/logs/:id** — New

Retrieve a single log entry by its ID.

Path: `:id` — the log entry ID

Success Response (200):

```json
{
  "log": {
    "_id": "log_id",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "method": "GET",
    "path": "/api/test",
    "statusCode": 200,
    "responseTime": 50,
    "userId": "user_id",
    "userEmail": "user@email.com",
    "ipAddress": "127.0.0.1",
    "userAgent": "...",
    "requestHeaders": {},
    "requestBody": {},
    "queryParams": {},
    "responseBody": {},
    "isSlow": false,
    "isError": false
  }
}
```

- 400 — `"Invalid log ID format"` — when ID format is invalid
- 403 — `"Admin access required"` — when user is not an admin
- 404 — `"Log not found"` — when log ID does not exist

---

## Additional Information

- A utility module is provided at `backend/src/utils/apiLoggerUtils.js` with helper functions for sensitive field redaction (`sanitizeObject`), header sanitization (`sanitizeHeaders`), body truncation (`truncateBody`), and client IP extraction (`getClientIp`). It also exports constants for the slow request threshold (`SLOW_THRESHOLD`: 1000ms) and maximum body size (`MAX_BODY_SIZE`: 10KB). You may use these utilities in your implementation.
- Logs are returned in descending order by default (newest first).
- Sensitive data is automatically sanitized before storage — passwords, tokens, API keys, and authorization headers are never stored in plain text.
- To manually reset the database, stop the running server and then restart it.
- The code repository may intentionally contain other issues that are unrelated to this specific task. Focus only on the described task requirements.
- If using Run and Debug mode, reload the preview once the backend setup is complete.
