# Workflow (MERN): Delete Issue with Cascade Deletion

## Overview

Workflow is a project management platform where teams can manage issues, track progress, and collaborate. Issues can be organized in parent-child hierarchies, and each issue may have associated comments and activity records.

Currently, there is no ability to delete issues. Your task is to implement a delete issue endpoint that supports cascade deletion — when an issue is deleted, all its descendant sub-issues, along with their associated comments and activity records, are also removed from the database.

## Expected API Behavior

**1. DELETE /api/issues/:identifier**

Purpose: Delete an issue and all its descendants, including associated comments and activities

Auth: Required (Bearer token)

Path Parameters:
- `identifier` (required): The identifier of the issue (e.g., "DEL-1")

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

## Additional Information

- The cascade deletion must use the `getDescendants` helper from `issueHierarchy.js` to recursively collect all descendant issue IDs before deletion
- Comments and IssueActivity records referencing any of the deleted issues must be removed
- To manually reset the database, stop the running server and then restart it
- The code repository may intentionally contain other issues that are unrelated to this specific task. Please focus only on the described task requirements and address bugs or errors directly associated with them
- If you're using Run and Debug mode in the IDE, the frontend server may start before the backend (including database seeding) is ready. In that case, the frontend might not display any data. Please reload the preview once the backend setup is complete
