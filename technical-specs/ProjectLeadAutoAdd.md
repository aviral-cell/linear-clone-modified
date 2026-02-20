# Workflow (MERN): Project Lead Auto-Add to Members

## Overview

Workflow is a project management platform where teams can manage projects, issues, track progress, and collaborate. Each project can have a designated lead and a list of members. The application includes logic to automatically add the project lead to the members list, but there are bugs — the lead is not being added to members in all scenarios, and deduplication is not handled correctly. Your task is to fix the auto-add logic so that the project lead is always present in the members array whenever a lead is set or changed, for both project creation and updates.

## Expected API Behavior

All endpoints require Bearer token authentication. Unauthenticated requests return 401.

**1. POST /api/projects** — Modify

Create a new project, automatically including the lead in the members list.

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

---

**2. PUT /api/projects/:identifier** — Modify

Update a project, ensuring the lead is always present in the members list.

Path: `:identifier` — project identifier (e.g., "my-project")

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
- If both `leadId` and `memberIds` are provided and `memberIds` excludes the new lead, the lead is automatically appended
- If only `memberIds` is updated and excludes the existing lead, the existing lead is automatically added back

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

- 404 — `"Project not found"` — when project identifier does not exist

---

## Additional Information

- The lead must never be duplicated in the members array — deduplication is required.
- The auto-add logic applies in all scenarios: create with lead only, create with lead and members, update lead only, update members only, and update both simultaneously.
- To manually reset the database, stop the running server and then restart it.
- The code repository may intentionally contain other issues that are unrelated to this specific task. Focus only on the described task requirements.
- If using Run and Debug mode, reload the preview once the backend setup is complete.
