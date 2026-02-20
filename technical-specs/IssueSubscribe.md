# Workflow (MERN): Issue Subscribe

## Overview

Workflow is a project management platform where teams can manage issues, track progress, and collaborate. Currently, there is no way for users to follow specific issues they are interested in. Your task is to implement a toggle-based subscription system where users can subscribe to and unsubscribe from issues, view their subscription status on issue details, and retrieve all their subscribed issues through a dedicated filter.

## Expected API Behavior

All endpoints require Bearer token authentication. Unauthenticated requests return 401.

**1. POST /api/issues/:identifier/subscribe** — Modify

Toggle the current user's subscription to an issue (subscribe if not subscribed, unsubscribe if already subscribed).

Path: `:identifier` — issue identifier (e.g., "SUB-1")

When subscribing:
```json
{
  "subscribed": true
}
```

When unsubscribing:
```json
{
  "subscribed": false
}
```

- If the user is not currently subscribed, they are added to the subscribers list and the response returns `subscribed: true`
- If the user is already subscribed, they are removed from the subscribers list and the response returns `subscribed: false`
- Multiple users can subscribe to the same issue independently
- Unsubscribing one user does not affect other users' subscriptions

- 404 — `"Issue not found"` — when issue identifier does not exist

---

**2. GET /api/issues/:identifier** — Modify

Retrieve issue details including subscription status for the current user.

Path: `:identifier` — issue identifier (e.g., "SUB-1")

The response includes an `isSubscribed` boolean field: `true` if the authenticated user is subscribed, `false` otherwise. The value is user-specific — different users see their own subscription status.

Success Response (200):

```json
{
  "issue": {
    "_id": "issue_id",
    "identifier": "SUB-1",
    "title": "Subscribe Test Issue",
    "status": "todo",
    "priority": "high",
    "team": { "_id": "team_id", "name": "Subscribe Team", "key": "SUB" },
    "assignee": { "_id": "user_id", "name": "User B", "email": "userb@test.com" },
    "creator": { "_id": "user_id", "name": "User A", "email": "usera@test.com" },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "subIssues": [],
  "isSubscribed": false
}
```

- 404 — `"Issue not found"` — when issue identifier does not exist

---

**3. GET /api/issues/my-issues?filter=subscribed** — Modify

Retrieve all issues the current user is subscribed to.

Query Parameters:
- `filter` (required): Set to `"subscribed"` to get subscribed issues

Returns only issues where the current user is in the subscribers list. Returns an empty array if the user has no active subscriptions. Issues the user previously unsubscribed from are not included. Other filter values (`created`, `assigned`) continue to work as before.

Success Response (200):

```json
{
  "issues": [
    {
      "_id": "issue_id",
      "identifier": "SUB-1",
      "title": "Subscribe Test Issue",
      "status": "todo",
      "priority": "high",
      "team": { "_id": "team_id", "name": "Subscribe Team", "key": "SUB" },
      "assignee": { "_id": "user_id", "name": "User B", "email": "userb@test.com" },
      "creator": { "_id": "user_id", "name": "User A", "email": "usera@test.com" }
    }
  ]
}
```

---

## Additional Information

- Subscription is implemented as a toggle — the same endpoint handles both subscribe and unsubscribe.
- The `isSubscribed` field is computed per request based on the authenticated user; it is not stored as a separate field.
- To manually reset the database, stop the running server and then restart it.
- The code repository may intentionally contain other issues that are unrelated to this specific task. Focus only on the described task requirements.
- If using Run and Debug mode, reload the preview once the backend setup is complete.
