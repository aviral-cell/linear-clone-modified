# Workflow (MERN): Issue Activity Tracker

## Overview

Workflow is a project management platform where teams can manage issues, track progress, and collaborate. The application includes an activity tracking system that records changes made to issues, providing an audit trail of lifecycle events. However, there are bugs in the activity tracker — activities are not being created correctly for issue creation and field updates, and the activities endpoint does not return results in the expected order. Your task is to fix these issues so that activities are properly recorded and retrieved.

## Expected API Behavior

All endpoints require Bearer token authentication. Unauthenticated requests return 401.

**1. POST /api/issues** — Modify

Create a new issue and automatically record a "created" activity.

When an issue is successfully created, an activity record is automatically created with `action: "created"`, the issue ID, and the authenticated user's ID. The `changes` field is not set for "created" actions.

Success Response (201):

```json
{
  "issue": {
    "_id": "issue_id",
    "identifier": "TEAM-1",
    "title": "Issue Title",
    "description": "Issue Description",
    "status": "todo",
    "priority": "high",
    "team": { "_id": "team_id", "name": "Team Name", "key": "TEAM", "icon": "icon_url" },
    "assignee": { "_id": "user_id", "name": "User Name", "email": "user@email.com", "avatar": "avatar_url" },
    "creator": { "_id": "creator_id", "name": "Creator Name", "email": "creator@email.com", "avatar": "avatar_url" },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

- 400 — `"Title and team are required"` — when required fields are missing
- 404 — `"Team not found"` — when team ID does not exist

---

**2. PUT /api/issues/:identifier** — Modify

Update an existing issue and automatically record activities for each changed field.

Path: `:identifier` — issue identifier (e.g., "TEAM-1")

**Tracked Fields:**
- `title` → `action: "updated_title"`
- `description` → `action: "updated_description"`
- `status` → `action: "updated_status"`
- `priority` → `action: "updated_priority"`
- `assignee` → `action: "updated_assignee"`
- `project` → `action: "updated_project"`
- `parent` → `action: "updated_parent"`

For each changed field, an activity record is created with:
- `action`: `"updated_{field}"`
- `issue`: the issue ID
- `user`: the authenticated user's ID
- `changes`: `{ field, oldValue, newValue }`

If a field is updated to the same value it already has, no activity is created for that field. If multiple fields are updated simultaneously, separate activity records are created for each changed field.

Success Response (200):

```json
{
  "issue": {
    "_id": "issue_id",
    "identifier": "TEAM-1",
    "title": "Updated Title",
    "status": "in_progress",
    "priority": "high",
    "team": { "_id": "team_id", "name": "Team Name", "key": "TEAM", "icon": "icon_url" },
    "assignee": { "_id": "user_id", "name": "User Name", "email": "user@email.com", "avatar": "avatar_url" },
    "creator": { "_id": "creator_id", "name": "Creator Name", "email": "creator@email.com", "avatar": "avatar_url" },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

- 404 — `"Issue not found"` — when issue identifier does not exist

---

**3. GET /api/issues/:identifier/activities** — Modify

Retrieve all activity records for a specific issue.

Path: `:identifier` — issue identifier (e.g., "TEAM-1")

Activities are returned in descending order, with the most recent activities first. When multiple activities share the same creation timestamp, the most recently inserted activity appears first.

Success Response (200):

```json
{
  "activities": [
    {
      "_id": "activity_id",
      "issue": "issue_id",
      "user": { "_id": "user_id", "name": "User Name", "email": "user@email.com", "avatar": "avatar_url" },
      "action": "updated_status",
      "changes": { "field": "status", "oldValue": "todo", "newValue": "in_progress" },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

The `user` field is populated with name, email, and avatar. For "created" actions, the `changes` field is not present. For update actions, `changes` contains the field name, old value, and new value.

---

## Additional Information

- Activities are automatically created and cannot be manually created or modified through the API.
- Other activity types (`added_comment`, `updated_commnent`, `deleted_comment`, `added_label`, `removed_label`) are handled by other features and are not part of this task.
- To manually reset the database, stop the running server and then restart it.
- The code repository may intentionally contain other issues that are unrelated to this specific task. Focus only on the described task requirements.
- If using Run and Debug mode, reload the preview once the backend setup is complete.
