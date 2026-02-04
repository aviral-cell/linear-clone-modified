# API Logging System

## Overview

The API logging system captures all HTTP requests and responses for debugging, monitoring, and security auditing.

## Features

- Automatic logging of all API requests/responses
- Sensitive data sanitization (passwords, tokens)
- Performance tracking (slow request flagging)
- Error tracking with status codes
- Admin dashboard for viewing logs
- Automated log cleanup (configurable retention)

## Configuration

Add to `.env`:

```
LOG_RETENTION_DAYS=90
```

## API Endpoints

All endpoints require admin authentication.

### GET /api/admin/logs

Get paginated logs with filtering.

Query Parameters:
- `page`, `limit` - Pagination
- `method` - Filter by HTTP method
- `statusCode` - Filter by status (200, "4xx", "5xx")
- `startDate`, `endDate` - Date range
- `search` - Search path, email, IP
- `isSlow`, `isError` - Boolean flags

### GET /api/admin/logs/:id

Get detailed log entry.

### GET /api/admin/logs/stats

Get analytics and statistics.

### DELETE /api/admin/logs/cleanup

Manually delete old logs.

Query Parameters:
- `olderThanDays` - Delete logs older than N days (default: 90)

## Data Sanitization

The following are automatically redacted:
- Passwords
- Tokens (JWT, API keys)
- Authorization headers

## Performance

- Logging is asynchronous (non-blocking)
- Slow requests (>1000ms) are flagged
- Indexes on timestamp, userId, statusCode

## Cleanup

Automated cleanup runs daily at 2:00 AM, removing logs older than `LOG_RETENTION_DAYS` (default: 90).
