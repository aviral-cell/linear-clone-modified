# Bug Fix: Project Lead Auto-Add to Members

`Medium`

## Overview

**Skills:** Node.js (Intermediate)
**Recommended Duration:** 40 Minutes

Workflow is a project management platform similar to Linear where teams create and manage projects, track progress, and collaborate. Each project can have a designated lead and a list of members. The system is designed to automatically include the project lead in the members list, ensuring the lead always has member-level access.

Currently, the auto-add logic has multiple bugs — the lead is not always included in the members list when they should be, and deduplication is not handled correctly in all cases. These issues affect both project creation and project updates.

## Issue Summary

The UI for managing projects is already fully implemented — the project detail page shows the lead and a members panel, and both can be set during project creation or updated from the project settings. However, due to backend bugs, the lead is not reliably added to the members list. When creating a project with a lead but no members specified, the lead does not appear in the members panel. When creating a project with specific members that do not include the lead, the lead is still missing from the members list. On the update side, changing the project lead does not add the new lead to the existing members. Updating the members list without including the current lead removes the lead from members entirely. In cases where the lead is already a member, the system may add them again, resulting in a duplicate entry.

## Steps to Reproduce

1. Log in using credentials:
   - Email: alice@workflow.dev
   - Password: Password@123
2. Create a new project with a lead assigned but no members specified — observe that the lead does not appear in the members panel.
3. Create a new project with a lead assigned and a separate list of members that does not include the lead — observe that the lead is missing from the members list.
4. Create a new project with a lead assigned and a members list that already includes the lead — observe that the lead may appear duplicated in the members panel.
5. Open an existing project that has no members and set a lead — observe that the new lead does not appear as a member.
6. Open an existing project that has members and change the lead to a different user — observe that the new lead is not added to the existing members.
7. Open an existing project and update the members list to a set of users that does not include the current lead — observe that the lead is removed from the members list entirely.
8. Open an existing project and update both the lead and the members list at the same time, where the new members do not include the new lead — observe that the lead is missing from the updated members list.

## Expected Behavior

- When creating a project with a lead but no members, the lead is automatically added to the members list.
- When creating a project with a lead and members that do not include the lead, the lead is automatically added alongside the other members.
- When creating a project where the lead is already included in the members list, no duplicate entry is created — the lead appears exactly once.
- When updating the lead on a project with no existing members, the new lead is added to the members list.
- When updating the lead without changing the members, the new lead is added to the existing members list and existing members are preserved.
- When updating the lead to someone who is already a member, no duplicate entry is created.
- When updating both the lead and the members list together and the new members do not include the new lead, the lead is automatically added.
- When updating only the members list and the current lead is not included, the lead is automatically added back to the members list.

**Note:** Make sure to review the `technical-specs/ProjectLeadAutoAdd.md` file carefully to understand all the specifications.
