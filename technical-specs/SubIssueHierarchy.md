# Workflow (MERN): Sub Issue Hierarchy

## Overview

Workflow is a project management platform where teams can manage issues, track progress, and collaborate. The application supports a sub-issue hierarchy where issues can be organized in parent-child relationships, with a valid-parents endpoint and hierarchy validation on create and update. However, there are bugs in the hierarchy validation — circular references, self-parenting, cross-team assignments, and depth limit violations are not being properly rejected. Your task is to fix these validation issues so that the hierarchy enforces a maximum depth of 5 levels and correctly prevents invalid parent assignments.

## Expected API Behavior

All endpoints require Bearer token authentication. Unauthenticated requests return 401.

**1. GET /api/issues/:identifier/valid-parents** — Modify

Retrieve all issues that can be set as a valid parent for the given issue.

Path: `:identifier` — issue identifier (e.g., "TEST-1")

Success Response (200):

```json
{
  "validParents": [
    {
      "_id": "issue_id",
      "identifier": "TEST-5",
      "title": "Issue Title",
      "status": "todo",
      "priority": "high",
      "team": "team_id",
      "parent": null
    }
  ]
}
```

**Filtering Rules:**
- Excludes the issue itself (no self-parenting)
- Excludes all descendants of the issue (prevents circular references)
- Excludes issues from different teams (parent must be in the same team)
- Excludes issues where assigning them as parent would exceed the maximum nesting depth of 5 levels

- 404 — `"Issue not found"` — when issue identifier does not exist

---

**2. POST /api/issues** — Modify

Create a new issue, optionally as a sub-issue of an existing parent.

Request body includes optional `parent` field with a parent issue ID.

**Hierarchy Validation on Create:**
- If `parent` is provided, the parent issue must exist
- The parent issue's depth must be less than the maximum depth (5), otherwise the creation is rejected
- The parent must be in the same team as the new issue

Success Response (201):

```json
{
  "issue": {
    "_id": "issue_id",
    "identifier": "TEST-6",
    "title": "Sub-Issue Title",
    "parent": "parent_issue_id",
    "team": { "_id": "team_id", "name": "Team Name", "key": "TEST" }
  }
}
```

- 400 — `"Title and team are required"` — when required fields are missing
- 400 — `"Parent issue not found"` — when parent issue ID is invalid
- 400 — message containing `"nested"` — when maximum nesting depth would be exceeded

---

**3. PUT /api/issues/:identifier** — Modify

Update an existing issue's parent, supporting reparenting and unparenting.

Path: `:identifier` — issue identifier (e.g., "TEST-1")

Set `parent` to a new issue ID to reparent, or `null` to make it a root issue.

**Hierarchy Validation on Update:**
- Cannot set an issue as its own parent. Error message contains `"own parent"`
- Cannot set a descendant (direct or indirect) as parent. Error message contains `"circular"` or `"descendant"`
- The resulting hierarchy depth must not exceed 5 levels. Error message contains `"nested"`
- Setting `parent` to `null` removes the parent relationship (always valid)

Success Response (200):

```json
{
  "issue": {
    "_id": "issue_id",
    "identifier": "TEST-4",
    "title": "Issue Title",
    "parent": "new_parent_issue_id"
  }
}
```

- 400 — message containing `"own parent"` — when self-parenting is attempted
- 400 — message containing `"circular"` or `"descendant"` — when circular reference is detected
- 400 — message containing `"nested"` — when maximum depth would be exceeded
- 404 — `"Issue not found"` — when issue identifier does not exist

---

## Additional Information

- The maximum nesting depth is 5 levels (root issue at depth 1, deepest child at depth 5).
- When validating a parent change, both the ancestor chain depth and the subtree depth of the issue are considered to ensure the total does not exceed 5.
- Valid parent candidates are filtered to only include issues from the same team as the target issue.
- To manually reset the database, stop the running server and then restart it.
- The code repository may intentionally contain other issues that are unrelated to this specific task. Focus only on the described task requirements.
- If using Run and Debug mode, reload the preview once the backend setup is complete.
