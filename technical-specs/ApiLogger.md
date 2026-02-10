# Workflow (MERN): API Logger

## Overview

Workflow is a project management platform where teams can manage issues, track progress, and collaborate. The API logger feature provides administrators with full visibility into API usage by automatically recording all HTTP requests made to the server. Admins can view, filter, search, and analyze API logs through dedicated admin endpoints.

The logger middleware captures request and response metadata including HTTP method, path, status code, response time, user information, and flags for slow or errored requests. Sensitive data such as passwords, tokens, and authorization headers are automatically sanitized before storage.

## Expected API Behavior

**1. Automatic Request Logging (Middleware)**

Purpose: Automatically log all API requests and responses

All HTTP requests (except `/health` and `/`) are automatically logged with the following captured data:

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

**Key Behaviors:**
- `isSlow` is set to `true` when `responseTime` exceeds 1000ms
- `isError` is set to `true` when `statusCode` is 400 or above
- Sensitive fields in request/response bodies are redacted (passwords, tokens, secrets, API keys)
- Authorization and cookie headers are redacted
- Request/response bodies larger than 10KB are truncated
- Logging is asynchronous and does not block the response

---

**2. GET /api/admin/logs**

Purpose: Retrieve API logs with filtering, searching, sorting, and pagination

Auth: Required (Bearer token, admin role only)

Query Parameters (all optional):

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (minimum 1) |
| `limit` | number | 50 | Results per page (1-100) |
| `method` | string | — | Filter by HTTP method (e.g., `POST`, `GET`) |
| `statusCode` | string | — | Filter by status code or range (`2xx`, `3xx`, `4xx`, `5xx`, or exact code like `404`) |
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
- `statusCode=2xx` — matches status codes 200-299
- `statusCode=3xx` — matches status codes 300-399
- `statusCode=4xx` — matches status codes 400-499
- `statusCode=5xx` — matches status codes 500+
- `statusCode=404` — matches exact status code 404

**Combined Filters:**
- Multiple filters are applied simultaneously with AND logic
- Example: `?method=GET&userId=abc123&statusCode=2xx` — returns only GET requests by the specified user that returned 2xx status codes

Error Responses:
- 401 - Unauthorized (missing or invalid token)
- 403 - Forbidden (non-admin user):
  ```json
  {
     "message": "Admin access required"
  }
  ```
- 500 - Server error
---

**3. GET /api/admin/logs/:id**

Purpose: Retrieve a single log entry by its ID

Auth: Required (Bearer token, admin role only)

Path Parameters:
- `id` (required): The MongoDB ObjectId of the log entry

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

Error Responses:
- 400 - Invalid ID format:
  ```json
  {
     "message": "Invalid log ID format"
  }
  ```
- 401 - Unauthorized (missing or invalid token)
- 403 - Forbidden (non-admin user)
- 404 - Log not found:
  ```json
  {
     "message": "Log not found"
  }
  ```
- 500 - Server error
---

**4. GET /api/admin/logs/stats**

Purpose: Retrieve aggregate statistics about API usage

Auth: Required (Bearer token, admin role only)

Query Parameters (all optional):
- `startDate` (ISO string): Filter stats from this date
- `endDate` (ISO string): Filter stats until this date

Success Response (200):

```json
{
   "stats": {
      "totalRequests": 1000,
      "averageResponseTime": 85,
      "errorRate": 5.2,
      "slowRequestRate": 1.8,
      "statusCodeDistribution": {
         "2xx": 850,
         "3xx": 50,
         "4xx": 80,
         "5xx": 20
      },
      "topEndpoints": [
         {
            "path": "/api/issues",
            "count": 250,
            "avgResponseTime": 75
         }
      ],
      "topUsers": [
         {
            "userId": "user_id",
            "userEmail": "admin@workflow.dev",
            "requestCount": 150
         }
      ]
   }
}
```

**Stats Fields:**
- `totalRequests`: Total number of logged API requests
- `averageResponseTime`: Mean response time in milliseconds
- `errorRate`: Percentage of requests with status code >= 400 (1 decimal place)
- `slowRequestRate`: Percentage of requests exceeding the slow threshold (1 decimal place)
- `statusCodeDistribution`: Count of requests grouped by status code range
- `topEndpoints`: Top 10 most requested paths with request count and average response time
- `topUsers`: Top 10 users by request count

Error Responses:
- 401 - Unauthorized (missing or invalid token)
- 403 - Forbidden (non-admin user)
- 500 - Server error
---

## Additional Information

- All admin log endpoints require both authentication and admin role authorization
- Regular (non-admin) users receive a 403 response with `"Admin access required"`
- Unauthenticated requests receive a 401 response
- Logs are sorted by timestamp in descending order by default (newest first)
- The API logger runs as Express middleware and captures data for every request except health checks
- Sensitive data is automatically sanitized before storage — passwords, tokens, API keys, and authorization headers are never stored in plain text
- To manually reset the database, stop the running server and then restart it
- The code repository may intentionally contain other issues that are unrelated to this specific task. Please focus only on the described task requirements and address bugs or errors directly associated with them
- If you're using Run and Debug mode in the IDE, the frontend server may start before the backend (including database seeding) is ready. In that case, the frontend might not display any data. Please reload the preview once the backend setup is complete
