# Workflow (MERN): Advanced Issue Filters

## Overview

Workflow is a project management platform where teams can manage issues, track progress, and collaborate. Currently, the team issues endpoint returns all issues for a team without any filtering capability. Your task is to implement server-side filtering on the team issues endpoint, supporting filters by status, priority, assignee, creator, and parent relationship.

## Expected API Behavior

All endpoints require Bearer token authentication. Unauthenticated requests return 401.

**1. GET /api/issues** — Modify

Retrieve issues with optional filtering by team and multiple criteria.

Query Parameters (all optional):
- `teamId` (string): Filter by team ID
- `status` (string): Single value or comma-separated multiple values
- `priority` (string): Single value or comma-separated multiple values
- `assignee` (string): Filter by assignee user ID
- `creator` (string): Filter by creator user ID
- `parent` (string): Filter by parent issue ID, or `"null"` for root-level issues only

**Valid Status Values:** `backlog`, `todo`, `in_progress`, `in_review`, `done`, `cancelled`, `duplicate`

**Valid Priority Values:** `no_priority`, `urgent`, `high`, `medium`, `low`

Success Response (200):

```json
{
  "issues": [
    {
      "_id": "issue_id",
      "identifier": "FLT-1",
      "title": "Parent Issue",
      "status": "todo",
      "priority": "high",
      "team": { "_id": "team_id", "name": "Filter Team", "key": "FLT" },
      "assignee": { "_id": "user_id", "name": "User A", "email": "usera@test.com" },
      "creator": { "_id": "user_id", "name": "User A", "email": "usera@test.com" },
      "parent": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Filter Behavior:**

1. **Status Filter:**
   - Single value: `?status=todo` — returns only issues with status `todo`
   - Multiple values: `?status=in_progress,done` — returns issues matching any of the provided values

2. **Priority Filter:**
   - Single value: `?priority=high` — returns only issues with priority `high`
   - Multiple values: `?priority=urgent,low` — returns issues matching any of the provided values

3. **Assignee Filter:** `?assignee=userId` — returns only issues assigned to the specified user

4. **Creator Filter:** `?creator=userId` — returns only issues created by the specified user

5. **Parent Filter:**
   - `?parent=null` — returns only root-level issues (no parent)
   - `?parent=issueId` — returns only direct children of the specified parent issue

6. **Combined Filters:** Multiple filters can be applied simultaneously with AND logic. When no filters match, an empty array is returned.

7. **No Filters:** When no query parameters are provided, all issues for the team are returned.

**Response Fields:**
- Issues include populated `team`, `assignee`, `creator`, and `parent` fields
- The `assignee` field is `null` for unassigned issues
- Results are returned in descending order, with the most recently created issues first

---

## Additional Information

- The `parent=null` filter matches issues where the parent field is null (root-level issues).
- To manually reset the database, stop the running server and then restart it.
- The code repository may intentionally contain other issues that are unrelated to this specific task. Focus only on the described task requirements.
- If using Run and Debug mode, reload the preview once the backend setup is complete.
