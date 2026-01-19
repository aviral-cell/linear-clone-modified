# Workflow (MERN): Issue Activity Tracker

## Overview

Workflow is a project management platform where teams can manage issues, track progress, and collaborate. The activity tracker feature automatically records all changes made to issues, providing a complete audit trail of issue lifecycle events including creation, status changes, priority updates, assignee changes, and content modifications.

The activity tracker automatically creates activity records whenever an issue is created or updated, allowing team members to see the complete history of changes made to any issue over time.

## Expected API Behavior

**1. POST /api/issues**

Purpose: Create a new issue and automatically record a "created" activity

Auth: Required (Bearer token)

Request Body:

```json
{
   "title": "Issue Title",
   "description": "Issue Description",
   "status": "todo",
   "priority": "high",
   "teamId": "team_id",
   "assignee": "user_id",
   "parentIssue": "parent_issue_id",
   "labels": ["label1", "label2"]
}
```

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
      "team": {
         "_id": "team_id",
         "name": "Team Name",
         "key": "TEAM",
         "icon": "icon_url"
      },
      "assignee": {
         "_id": "user_id",
         "name": "User Name",
         "email": "user@email.com",
         "avatar": "avatar_url"
      },
      "creator": {
         "_id": "creator_id",
         "name": "Creator Name",
         "email": "creator@email.com",
         "avatar": "avatar_url"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
   }
}
```

**Activity Creation:**
- When an issue is successfully created, an activity record must be automatically created with:
  - `action`: `"created"`
  - `issue`: The ID of the newly created issue
  - `user`: The ID of the authenticated user who created the issue
  - `changes`: Should be `undefined` or empty (not set) for "created" actions

Error Responses:
- 400 - Validation errors:
  - `"Title and team are required"` - Missing required fields
  - `"Parent issue not found"` - Invalid parent issue ID
  - `"Sub-issues cannot have another sub-issue"` - Invalid hierarchy
- 401 - Unauthorized (missing or invalid token)
- 404 - Team not found:
  ```json
  {
     "message": "Team not found"
  }
  ```
- 500 - Server error

---

**2. PUT /api/issues/:identifier**

Purpose: Update an existing issue and automatically record activities for each changed field

Auth: Required (Bearer token)

Path Parameters:
- `identifier` (required): The identifier of the issue (e.g., "TEAM-1")

Request Body (all fields optional):

```json
{
   "title": "Updated Title",
   "description": "Updated Description",
   "status": "in_progress",
   "priority": "high",
   "assignee": "user_id"
}
```

Success Response (200):

```json
{
   "issue": {
      "_id": "issue_id",
      "identifier": "TEAM-1",
      "title": "Updated Title",
      "description": "Updated Description",
      "status": "in_progress",
      "priority": "high",
      "team": {
         "_id": "team_id",
         "name": "Team Name",
         "key": "TEAM",
         "icon": "icon_url"
      },
      "assignee": {
         "_id": "user_id",
         "name": "User Name",
         "email": "user@email.com",
         "avatar": "avatar_url"
      },
      "creator": {
         "_id": "creator_id",
         "name": "Creator Name",
         "email": "creator@email.com",
         "avatar": "avatar_url"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
   }
}
```

**Tracked Fields:**
- `status` → Creates activity with `action: "updated_status"`
- `priority` → Creates activity with `action: "updated_priority"`
- `assignee` → Creates activity with `action: "updated_assignee"`
- `title` → Creates activity with `action: "updated_title"`
- `description` → Creates activity with `action: "updated_description"`

**Activity Structure for Updates:**

For each changed field, an activity record is created with:
- `action`: `"updated_{field}"` (e.g., `"updated_status"`, `"updated_priority"`)
- `issue`: The ID of the updated issue
- `user`: The ID of the authenticated user who made the change
- `changes`: An object containing:
  - `field`: The name of the field that changed (e.g., `"status"`, `"priority"`)
  - `oldValue`: The previous value of the field
  - `newValue`: The new value of the field

**Important Behaviors:**
- If a field is updated to the same value it already has, **no activity is created** for that field
- If multiple fields are updated simultaneously, **separate activity records are created** for each changed field
- Activities are created **after** the issue is successfully updated

**Example Scenarios:**

1. **Single Field Update:**
   - Request: `{ "status": "in_progress" }`
   - Current status: `"todo"`
   - Result: One activity created with `action: "updated_status"`, `changes: { field: "status", oldValue: "todo", newValue: "in_progress" }`

2. **Multiple Fields Update:**
   - Request: `{ "status": "in_progress", "priority": "high", "title": "New Title" }`
   - Current values: `status: "todo"`, `priority: "no_priority"`, `title: "Old Title"`
   - Result: Three separate activities created:
     - `action: "updated_status"`, `changes: { field: "status", oldValue: "todo", newValue: "in_progress" }`
     - `action: "updated_priority"`, `changes: { field: "priority", oldValue: "no_priority", newValue: "high" }`
     - `action: "updated_title"`, `changes: { field: "title", oldValue: "Old Title", newValue: "New Title" }`

3. **No Change (Same Value):**
   - Request: `{ "status": "todo" }`
   - Current status: `"todo"`
   - Result: **No activity created** (value unchanged)

4. **Partial Update:**
   - Request: `{ "status": "in_progress", "priority": "high" }`
   - Current values: `status: "todo"`, `priority: "high"`
   - Result: One activity created only for status change (priority unchanged)

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

**3. GET /api/activities/issue/:issueId**

Purpose: Retrieve all activity records for a specific issue, sorted by creation date (newest first)

Auth: Required (Bearer token)

Path Parameters:
- `issueId` (required): The ID of the issue

Success Response (200):

```json
{
   "activities": [
      {
         "_id": "activity_id",
         "issue": "issue_id",
         "user": {
            "_id": "user_id",
            "name": "User Name",
            "email": "user@email.com",
            "avatar": "avatar_url"
         },
         "action": "updated_status",
         "changes": {
            "field": "status",
            "oldValue": "todo",
            "newValue": "in_progress"
         },
         "createdAt": "2024-01-01T00:00:00.000Z",
         "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
         "_id": "activity_id_2",
         "issue": "issue_id",
         "user": {
            "_id": "creator_id",
            "name": "Creator Name",
            "email": "creator@email.com",
            "avatar": "avatar_url"
         },
         "action": "created",
         "createdAt": "2024-01-01T00:00:00.000Z",
         "updatedAt": "2024-01-01T00:00:00.000Z"
      }
   ]
}
```

**Response Details:**
- Activities are sorted by `createdAt` in descending order (newest first)
- The `user` field is populated with user details (name, email, avatar)
- For "created" actions, the `changes` field may be `undefined` or empty
- For update actions, the `changes` field contains the field name and old/new values

Error Responses:
- 401 - Unauthorized (missing or invalid token)
- 500 - Server error
---

## Additional Information

- Activities are automatically created and cannot be manually created or modified through the API
- Activities are permanent records and should not be deleted when issues are updated
- Note that there are other activity types (`added_comment`, `deleted_comment`, `added_label`, `removed_label`) are handled by other features and are not part of this task.
- To manually reset the database, stop the running server and then restart it
- The code repository may intentionally contain other issues that are unrelated to this specific task. Please focus only on the described task requirements and address bugs or errors directly associated with them
- If you're using Run and Debug mode in the IDE, the frontend server may start before the backend (including database seeding) is ready. In that case, the frontend might not display any data. Please reload the preview once the backend setup is complete

