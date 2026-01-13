# Workflow (MERN): Issue Comments Functionality

## Overview

Workflow is a project management platform, where teams can manage issues, track progress, and collaborate through comments. The comments feature allows team members to discuss issues, provide updates, and share information.

Currently, the comments functionality has some missing features and authorization issues. Your task is to implement proper comment ownership tracking, edit functionality, and authorization controls on the backend.

## Expected API Behavior

**1. GET /api/comments/issue/:issueId**

Purpose: Retrieve all comments for a specific issue with ownership information

Auth: Required (Bearer token)

Path Parameters:
- `issueId` (required): The ID of the issue

Success Response (200):

```json
{
   "comments": [
      {
         "_id": "comment_id",
         "issue": "issue_id",
         "user": {
            "_id": "user_id",
            "name": "User Name",
            "email": "user@email.com",
            "avatar": "avatar_url"
         },
         "content": "Comment content",
         "isEdited": false,
         "isOwner": true,
         "createdAt": "2024-01-01T00:00:00.000Z",
         "updatedAt": "2024-01-01T00:00:00.000Z"
      }
   ]
}
```

The `isOwner` field should be:
- `true` if the comment's `user._id` matches the authenticated user's ID
- `false` if the comment belongs to a different user
- A boolean value (not null or undefined) for all comments

Comments should be sorted by `createdAt` in ascending order (oldest first).

Error Responses:
- 401 - Unauthorized (missing or invalid token)
- 500 - Server error

**2. PUT /api/comments/:id**

Purpose: Update an existing comment's content

Auth: Required (Bearer token)

Path Parameters:
- `id` (required): The ID of the comment to update

Request Body:

```json
{
   "content": "Updated comment content"
}
```

Success Response (200):

```json
{
   "comment": {
      "_id": "comment_id",
      "issue": "issue_id",
      "user": {
         "_id": "user_id",
         "name": "User Name",
         "email": "user@email.com",
         "avatar": "avatar_url"
      },
      "content": "Updated comment content",
      "isEdited": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
   }
}
```

The `isEdited` field must be set to `true` when a comment is updated, even if it's the first update.

Error Responses:
- 400 - Validation errors:

```json
{
    "message": "Content is required"
}
```

- 401 - Unauthorized (missing or invalid token)
- 403 - Forbidden (user is not the comment owner):

```json
{
    "message": "Not authorized"
}
```

- 404 - Comment not found:

```json
{
    "message": "Comment not found"
}
```

- 500 - Server error

**3. DELETE /api/comments/:id**

Purpose: Delete a comment

Auth: Required (Bearer token)

Path Parameters:
- `id` (required): The ID of the comment to delete

Success Response (200):

```json
{
   "message": "Comment deleted successfully"
}
```

The comment should be permanently removed from the database.

Error Responses:
- 401 - Unauthorized (missing or invalid token)
- 403 - Forbidden (user is not the comment owner):

```json
{
    "message": "Not authorized"
}
```

- 404 - Comment not found:

```json
{
    "message": "Comment not found"
}
```

- 500 - Server error


## Additional Information

- To manually reset the database, stop the running server and then restart it.
- The code repository may intentionally contain other issues that are unrelated to this specific task. Please focus only on the described task requirements and address bugs or errors directly associated with them
- If you’re using Run and Debug mode in the IDE, the frontend server may start before the backend (including database seeding) is ready. In that case, the frontend might not display any data. Please reload the preview once the backend setup is complete.

