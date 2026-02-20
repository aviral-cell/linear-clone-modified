# Workflow (MERN): Comments Access Control

## Overview

Workflow is a project management platform where teams can manage issues, track progress, and collaborate through comments. The comments API supports creating, reading, updating, and deleting comments on issues. However, there are bugs related to ownership tracking and authorization — the `isOwner` field is not returned, the `isEdited` flag is not tracked, and any user can update or delete any comment regardless of ownership. Your task is to fix these issues so that comments correctly identify ownership, track edits, and restrict updates and deletes to the comment owner only.

## Expected API Behavior

All endpoints require Bearer token authentication. Unauthenticated requests return 401.

Only the comment owner can update or delete a comment. When a non-owner attempts to update or delete, the request is rejected with 403 and the comment remains unchanged in the database.

**1. GET /api/issues/:identifier/comments** — Modify

Retrieve all comments for an issue with ownership information.

Path: `:identifier` — issue identifier (e.g., "TEAM-1")

Each comment includes an `isOwner` boolean field computed per request based on the authenticated user:
- `true` when the comment belongs to the authenticated user
- `false` when the comment belongs to a different user

The same comment returns different `isOwner` values depending on which user is making the request.

Success Response (200):

```json
{
  "comments": [
    {
      "_id": "comment_id",
      "issue": "issue_id",
      "user": { "_id": "user_id", "name": "User Name", "email": "user@email.com", "avatar": "avatar_url" },
      "content": "Comment content",
      "isEdited": false,
      "isOwner": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

**2. PUT /api/issues/:identifier/comments/:id** — Modify

Update a comment's content. Only the comment owner can perform this action.

Path: `:identifier` — issue identifier, `:id` — comment ID

Request body: `{ "content": "Updated text" }`

When the owner updates a comment, the `isEdited` field is set to `true` in the response and persisted to the database.

Success Response (200):

```json
{
  "comment": {
    "_id": "comment_id",
    "content": "Updated text",
    "isEdited": true,
    "user": { "_id": "user_id", "name": "User Name", "email": "user@email.com", "avatar": "avatar_url" }
  }
}
```

- 400 — `"Content is required"` — when content is empty or missing
- 403 — `"Not authorized"` — when user is not the comment owner
- 404 — `"Comment not found"` — when comment ID does not exist

---

**3. DELETE /api/issues/:identifier/comments/:id** — Modify

Delete a comment permanently. Only the comment owner can perform this action. The comment is removed from the database.

Path: `:identifier` — issue identifier, `:id` — comment ID

Success Response (200):

```json
{
  "message": "Comment deleted successfully"
}
```

- 403 — `"Not authorized"` — when user is not the comment owner
- 404 — `"Comment not found"` — when comment ID does not exist

---

## Additional Information

- To manually reset the database, stop the running server and then restart it.
- The code repository may intentionally contain other issues that are unrelated to this specific task. Focus only on the described task requirements.
- If using Run and Debug mode, reload the preview once the backend setup is complete.
