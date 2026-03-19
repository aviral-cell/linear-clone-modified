# Feature: API Logger

`Hard`

## Overview

**Skills:** Node.js (Intermediate)
**Recommended Duration:** 60 Minutes

Workflow is a project management platform similar to Linear where teams create and manage issues, track progress, and collaborate. As the platform scales, the engineering team needs visibility into how the API is being used — which endpoints are called most often, which requests are slow, and where errors are occurring.

Currently, there is no API request logging. The UI already includes a fully implemented API Logs page — accessible from the sidebar at the bottom for admin users — with filters, search, sorting, and pagination. The backend currently returns sample data to demonstrate the expected UI behavior, but it does not record any actual requests. Admin-only access to these endpoints is also not enforced.

You need to remove the sample data implementation and build the actual backend API logging system: a middleware that automatically records every request, and admin endpoints that serve the logged data with filtering, search, sorting, and pagination.

## Product Requirements

- Every API request is automatically logged with details including the HTTP method, URL path, response status, response time, user information, IP address, and request/response data.
- Requests that take longer than 1 second are flagged as slow. Requests that result in error responses (status 400 or above) are flagged as errors.
- Sensitive information such as passwords, tokens, and API keys is automatically redacted before storage. Authorization headers are also redacted.
- Large request and response bodies are truncated to prevent excessive storage usage.
- Logging happens asynchronously and does not slow down the response to the user.
- Only admin users can access the logs. Non-admin users are denied access with an appropriate error message. Unauthenticated requests are also rejected.
- Admins can view a paginated list of all logged requests, with configurable page size and page navigation.
- Admins can filter logs by HTTP method (e.g., show only POST requests).
- Admins can filter logs by response status — either by range (all success responses, all client errors, all server errors) or by exact status code.
- Admins can filter logs by date range to see requests within a specific time period.
- Admins can filter logs by a specific user to see only that user's API activity.
- Admins can filter for only slow requests or only error requests using dedicated flags.
- Admins can search logs by URL path, user email, or IP address (case-insensitive).
- Multiple filters can be applied at the same time (AND logic).
- Admins can sort logs by timestamp or response time, in ascending or descending order. The default sort is by most recent first.
- Admins can view the full details of a single log entry by its ID. Invalid or non-existent IDs return appropriate error messages.

## Steps to Test Functionality

1. Log in as an admin user using credentials:
   - Email: alice@workflow.dev
   - Password: Password@123
2. Navigate around the application (view issues, teams, etc.) to generate some API activity.
3. Open the API Logs page from the sidebar — verify that the requests you just made appear in the log list.
4. Verify that each log entry shows the method, path, status code, response time, and timestamp.
5. Try accessing the logs page as a non-admin user — verify that access is denied.
6. Use the pagination controls to navigate through log pages — verify page numbers, next/previous indicators, and page sizes work correctly.
7. Filter logs by HTTP method (e.g., "GET") — verify that only matching requests are shown.
8. Filter logs by status code range (e.g., all success responses or all errors) — verify correct results.
9. Filter logs by a date range — verify that only logs within the selected time window appear.
10. Filter by a specific user — verify only that user's activity is shown.
11. Toggle the slow request and error request filters — verify the correct entries appear.
12. Use the search box to search by URL path, email, or IP address — verify matching results.
13. Apply multiple filters simultaneously — verify the results match all selected criteria.
14. Change the sort order (e.g., sort by response time ascending) — verify the entries reorder correctly.
15. Click on a single log entry to view its full details — verify all captured data is displayed.

**Note:** Make sure to review the `technical-specs/ApiLogger.md` file carefully to understand all the specifications.
