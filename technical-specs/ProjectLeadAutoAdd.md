# Workflow (MERN): Project Lead Auto-Add to Members

## Overview

Workflow is a project management platform where teams can manage projects, issues, track progress, and collaborate. Each project can have a designated lead and a list of members.

Currently, it is possible to set a project lead who is not included in the project's members list, creating an inconsistent state. Your task is to implement logic that automatically adds the project lead to the members array whenever a lead is set or changed, ensuring the lead is always a project member. This applies to both project creation and updates.

## Expected API Behavior

**1. POST /api/projects**

Purpose: Create a new project, automatically including the lead in the members list

Auth: Required (Bearer token)

Request Body:

```json
{
   "name": "Project Name",
   "teamId": "team_id",
   "leadId": "user_id",
   "memberIds": ["user_id_1", "user_id_2"]
}
```

**Auto-Add Rules on Create:**
- If `leadId` is provided but `memberIds` is omitted or empty, the lead is automatically added to the members array
- If `leadId` is provided and `memberIds` does not include the lead, the lead is automatically appended to the members array
- If `leadId` is provided and `memberIds` already includes the lead, no duplicate is added — the lead appears exactly once

Success Response (201):

```json
{
   "project": {
      "_id": "project_id",
      "name": "Project Name",
      "identifier": "project-name",
      "team": "team_id",
      "creator": "user_id",
      "lead": "lead_user_id",
      "members": ["lead_user_id", "member_user_id"]
   }
}
```

Error Responses:
- 401 - Unauthorized (missing or invalid token)
- 500 - Server error
---

**2. PUT /api/projects/:identifier**

Purpose: Update a project, ensuring the lead is always present in the members list

Auth: Required (Bearer token)

Path Parameters:
- `identifier` (required): The identifier of the project (e.g., "my-project")

Request Body:

```json
{
   "leadId": "new_lead_user_id",
   "memberIds": ["user_id_1", "user_id_2"]
}
```

**Auto-Add Rules on Update:**
- If `leadId` is updated and the project has no existing members, the new lead is added to the members array
- If `leadId` is updated without changing `memberIds`, the new lead is added to the existing members array (existing members are preserved)
- If `leadId` is updated and the new lead is already a member, no duplicate is added
- If both `leadId` and `memberIds` are provided and `memberIds` excludes the new lead, the lead is automatically appended to `memberIds`
- If only `memberIds` is updated and excludes the existing lead, the existing lead is automatically added back to the members array

Success Response (200):

```json
{
   "project": {
      "_id": "project_id",
      "name": "Project Name",
      "identifier": "my-project",
      "team": "team_id",
      "creator": "user_id",
      "lead": "lead_user_id",
      "members": ["lead_user_id", "member_user_id_1", "member_user_id_2"]
   }
}
```

Error Responses:
- 401 - Unauthorized (missing or invalid token)
- 404 - Project not found
- 500 - Server error
---

## Additional Information

- The lead must never be duplicated in the members array — deduplication is required
- The auto-add logic applies in all scenarios: create with lead only, create with lead and members, update lead only, update members only, and update both lead and members simultaneously
- To manually reset the database, stop the running server and then restart it
- The code repository may intentionally contain other issues that are unrelated to this specific task. Please focus only on the described task requirements and address bugs or errors directly associated with them
- If you're using Run and Debug mode in the IDE, the frontend server may start before the backend (including database seeding) is ready. In that case, the frontend might not display any data. Please reload the preview once the backend setup is complete
