# Workflow (MERN): Sub-Issue Hierarchy

## Overview

Workflow is a project management platform where teams can manage issues, track progress, and collaborate. The sub-issue hierarchy feature allows issues to be organized in parent-child relationships, enabling teams to break down large issues into smaller, more manageable sub-issues.

The hierarchy supports nesting up to 5 levels deep and enforces strict validation rules to prevent circular references, self-parenting, and cross-team parent assignments. A dedicated endpoint provides valid parent candidates for any given issue, making it easy for the UI to present only valid options.

## Expected API Behavior

**1. GET /api/issues/:identifier/valid-parents**

Purpose: Retrieve all issues that can be set as a valid parent for the given issue

Auth: Required (Bearer token)

Path Parameters:
- `identifier` (required): The identifier of the issue (e.g., "TEST-1")

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

**2. POST /api/issues**

Purpose: Create a new issue, optionally as a sub-issue of an existing parent

Auth: Required (Bearer token)

Request Body:

```json
{
   "title": "Sub-Issue Title",
   "description": "Sub-Issue Description",
   "status": "todo",
   "teamId": "team_id",
   "parent": "parent_issue_id"
}
```

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
      "team": {
         "_id": "team_id",
         "name": "Team Name",
         "key": "TEST"
      }
   }
}
```

Error Responses:
- 400 - Validation errors:
  - `"Title and team are required"` - Missing required fields
  - `"Parent issue not found"` - Invalid parent issue ID
  - Message containing `"nested"` - Maximum nesting depth exceeded
- 401 - Unauthorized (missing or invalid token)
- 404 - Team not found
- 500 - Server error
---

**3. PUT /api/issues/:identifier**

Purpose: Update an existing issue's parent, supporting reparenting and unparenting

Auth: Required (Bearer token)

Path Parameters:
- `identifier` (required): The identifier of the issue (e.g., "TEST-1")

Request Body (parent field):

```json
{
   "parent": "new_parent_issue_id"
}
```

To remove a parent (make the issue a root issue):

```json
{
   "parent": null
}
```

**Hierarchy Validation on Update:**
- Cannot set an issue as its own parent (self-parenting). Error message contains `"own parent"`
- Cannot set a direct child as parent (direct circular reference). Error message contains `"circular"` or `"descendant"`
- Cannot set an indirect descendant as parent (deep circular reference). Error message contains `"circular"` or `"descendant"`
- The resulting hierarchy depth must not exceed the maximum depth of 5 levels
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

Error Responses:
- 400 - Validation errors:
  - Message containing `"own parent"` - Self-parenting attempt
  - Message containing `"circular"` or `"descendant"` - Circular reference detected
  - Message containing `"nested"` - Maximum depth exceeded
- 401 - Unauthorized (missing or invalid token)
- 404 - Issue not found
- 500 - Server error
---

## Additional Information

- The maximum nesting depth is 5 levels (root issue at depth 1, deepest child at depth 5)
- Depth is calculated by traversing the parent chain up to the root
- Subtree depth is calculated by traversing all children recursively
- When validating a parent change, the system checks that the parent's depth plus the issue's subtree depth plus 1 does not exceed the maximum depth
- Valid parent candidates are filtered to only include issues from the same team as the target issue
- To manually reset the database, stop the running server and then restart it
- The code repository may intentionally contain other issues that are unrelated to this specific task. Please focus only on the described task requirements and address bugs or errors directly associated with them
- If you're using Run and Debug mode in the IDE, the frontend server may start before the backend (including database seeding) is ready. In that case, the frontend might not display any data. Please reload the preview once the backend setup is complete
