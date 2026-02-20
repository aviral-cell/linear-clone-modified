# Workflow (MERN): Delete Issue

## Overview

Workflow is a project management platform where teams can manage issues, track progress, and collaborate. Issues can be organized in parent-child hierarchies, and each issue may have associated comments and activity records.

Currently, there is no ability to delete issues. Your task is to implement a delete issue endpoint that supports cascade deletion — when an issue is deleted, all its descendant sub-issues, along with their associated comments and activity records, are also removed from the database.

## Expected API Behavior

All endpoints require Bearer token authentication. Unauthenticated requests return 401.

**1. DELETE /api/issues/:identifier** — New

Delete an issue and all its descendants, including associated comments and activities.

Path: `:identifier` — issue identifier (e.g., "DEL-1")

**Cascade Deletion Behavior:**
- Recursively finds all descendant issues (children, grandchildren, etc.) of the target issue
- Deletes all comments associated with the target issue and its descendants
- Deletes all activity records associated with the target issue and its descendants
- Deletes the target issue and all its descendants
- Unrelated issues (different parent chains, different teams) are not affected

Success Response (200):

```json
{
  "message": "Issue deleted successfully",
  "deletedCount": 3
}
```

The `deletedCount` reflects the total number of issues deleted (the target issue plus all its descendants).

**Selective Deletion:**
- Deleting a child issue does not affect its parent or sibling issues
- Only the targeted issue and its sub-tree are removed

- 404 — `"Issue not found"` — when issue identifier does not exist

---

## Additional Information

- Comments and activity records referencing any of the deleted issues are removed as part of the cascade.
- To manually reset the database, stop the running server and then restart it.
- The code repository may intentionally contain other issues that are unrelated to this specific task. Focus only on the described task requirements.
- If using Run and Debug mode, reload the preview once the backend setup is complete.
