# Workflow (MERN): Issue Subscribe

## Overview

Workflow is a project management platform where teams can manage issues, track progress, and collaborate. The subscribe feature allows users to follow specific issues they are interested in, even if they are not the creator or assignee. Subscribed users can track issues through a dedicated "subscribed" filter on the my-issues endpoint.

Your task is to implement a toggle-based subscription system where users can subscribe to and unsubscribe from issues, view their subscription status on issue details, and retrieve all their subscribed issues.

## Expected API Behavior

**1. POST /api/issues/:identifier/subscribe**

Purpose: Toggle the current user's subscription to an issue (subscribe if not subscribed, unsubscribe if already subscribed)

Auth: Required (Bearer token)

Path Parameters:
- `identifier` (required): The identifier of the issue (e.g., "SUB-1")

Success Response (200):

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

**Behavior:**
- If the user is not currently subscribed, they are added to the issue's subscribers list and the response returns `subscribed: true`
- If the user is already subscribed, they are removed from the issue's subscribers list and the response returns `subscribed: false`
- Multiple users can subscribe to the same issue independently
- Unsubscribing one user does not affect other users' subscriptions

Error Responses:
- 401 - Unauthorized (missing or invalid token)
- 404 - Issue not found:
  ```json
  {
     "message": "Issue not found"
  }
  ```
- 500 - Server error
---

**2. GET /api/issues/:identifier**

Purpose: Retrieve issue details including subscription status for the current user

Auth: Required (Bearer token)

Path Parameters:
- `identifier` (required): The identifier of the issue (e.g., "SUB-1")

Success Response (200):

```json
{
   "issue": {
      "_id": "issue_id",
      "identifier": "SUB-1",
      "title": "Subscribe Test Issue",
      "status": "todo",
      "priority": "high",
      "team": {
         "_id": "team_id",
         "name": "Subscribe Team",
         "key": "SUB"
      },
      "assignee": {
         "_id": "user_id",
         "name": "User B",
         "email": "userb@test.com"
      },
      "creator": {
         "_id": "user_id",
         "name": "User A",
         "email": "usera@test.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
   },
   "subIssues": [],
   "isSubscribed": false
}
```

**Key Fields:**
- `isSubscribed` (boolean): `true` if the authenticated user is in the issue's subscribers list, `false` otherwise
- `subIssues` (array): Child issues of the current issue
- The `isSubscribed` value is user-specific — different users see their own subscription status

Error Responses:
- 401 - Unauthorized (missing or invalid token)
- 404 - Issue not found
- 500 - Server error
---

**3. GET /api/issues/my-issues?filter=subscribed**

Purpose: Retrieve all issues the current user is subscribed to

Auth: Required (Bearer token)

Query Parameters:
- `filter` (required): Set to `"subscribed"` to get subscribed issues

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
         "team": {
            "_id": "team_id",
            "name": "Subscribe Team",
            "key": "SUB"
         },
         "assignee": {
            "_id": "user_id",
            "name": "User B",
            "email": "userb@test.com"
         },
         "creator": {
            "_id": "user_id",
            "name": "User A",
            "email": "usera@test.com"
         }
      }
   ]
}
```

**Behavior:**
- Returns only issues where the current user's ID is in the `subscribers` array
- Returns an empty array if the user has no active subscriptions
- Issues the user previously unsubscribed from are not included
- Other filter values (`created`, `assigned`) continue to work as before

Error Responses:
- 401 - Unauthorized (missing or invalid token)
- 500 - Server error
---

## Additional Information

- The `subscribers` field on the Issue model is an array of User ObjectIds
- Subscription is implemented as a toggle — the same endpoint handles both subscribe and unsubscribe
- The `isSubscribed` field is a computed value derived from the subscribers array and the current user's ID; it is not stored separately
- To manually reset the database, stop the running server and then restart it
- The code repository may intentionally contain other issues that are unrelated to this specific task. Please focus only on the described task requirements and address bugs or errors directly associated with them
- If you're using Run and Debug mode in the IDE, the frontend server may start before the backend (including database seeding) is ready. In that case, the frontend might not display any data. Please reload the preview once the backend setup is complete
