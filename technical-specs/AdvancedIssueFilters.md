# Workflow (MERN): Advanced Issue Filters

## Overview

Workflow is a project management platform where teams can manage issues, track progress, and collaborate. The advanced filtering feature allows team members to narrow down the issue list by applying one or more filters simultaneously, making it easier to find relevant issues in large backlogs.

Currently, the team issues endpoint returns all issues for a team without any filtering capability. Your task is to implement server-side filtering on the team issues endpoint, supporting filters by status, priority, assignee, creator, and parent relationship.

## Expected API Behavior

**1. GET /api/issues**

Purpose: Retrieve issues with optional filtering by team and multiple criteria

Auth: Required (Bearer token)

Query Parameters (all optional):
- `teamId` (string): Filter by team ID
- `status` (string): Filter by issue status. Supports single value or comma-separated multiple values
- `priority` (string): Filter by issue priority. Supports single value or comma-separated multiple values
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
         "team": {
            "_id": "team_id",
            "name": "Filter Team",
            "key": "FLT"
         },
         "assignee": {
            "_id": "user_id",
            "name": "User A",
            "email": "usera@test.com"
         },
         "creator": {
            "_id": "user_id",
            "name": "User A",
            "email": "usera@test.com"
         },
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
   - Multiple values: `?status=in_progress,done` — returns issues with status `in_progress` OR `done`

2. **Priority Filter:**
   - Single value: `?priority=high` — returns only issues with priority `high`
   - Multiple values: `?priority=urgent,low` — returns issues with priority `urgent` OR `low`

3. **Assignee Filter:**
   - `?assignee=userId` — returns only issues assigned to the specified user

4. **Creator Filter:**
   - `?creator=userId` — returns only issues created by the specified user

5. **Parent Filter:**
   - `?parent=null` — returns only root-level issues (no parent)
   - `?parent=issueId` — returns only direct children of the specified parent issue

6. **Combined Filters:**
   - Multiple filters can be applied simultaneously: `?status=todo&priority=high` — returns issues matching ALL specified criteria (AND logic)
   - When no filters match, an empty array is returned

7. **No Filters:**
   - When no query parameters are provided, all issues for the team are returned

**Response Fields:**
- Issues include populated `team`, `assignee`, `creator`, and `parent` fields
- The `assignee` field is `null` for unassigned issues
- Results are sorted by `createdAt` in descending order

Error Responses:
- 401 - Unauthorized (missing or invalid token)
- 500 - Server error
---

## Additional Information

- Comma-separated filter values use MongoDB `$in` operator for matching any of the provided values
- The `parent=null` filter specifically matches issues where the parent field is `null` (root-level issues)
- To manually reset the database, stop the running server and then restart it
- The code repository may intentionally contain other issues that are unrelated to this specific task. Please focus only on the described task requirements and address bugs or errors directly associated with them
- If you're using Run and Debug mode in the IDE, the frontend server may start before the backend (including database seeding) is ready. In that case, the frontend might not display any data. Please reload the preview once the backend setup is complete
