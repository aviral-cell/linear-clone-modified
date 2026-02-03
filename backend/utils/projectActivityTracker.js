import ProjectActivity from '../models/ProjectActivity.js';

/**
 * Derive the field name from the action type
 * @param {string} action - Action string (e.g., 'updated_lead', 'set_target_date')
 * @returns {string|null} Field name or null for actions without a field
 */
const deriveFieldFromAction = (action) => {
  const actionFieldMap = {
    updated_status: 'status',
    updated_priority: 'priority',
    set_target_date: 'targetDate',
    cleared_target_date: 'targetDate',
    set_start_date: 'startDate',
    cleared_start_date: 'startDate',
    updated_lead: 'lead',
    cleared_lead: 'lead',
    updated_team: 'team',
    updated_members: 'members',
    updated_name: 'name',
    updated_summary: 'summary',
    posted_update: 'update',
  };
  return actionFieldMap[action] || null;
};

/**
 * Normalize value for storage - extracts ID from populated documents
 * Values are resolved to human-readable text in the frontend using passed lists
 * (consistent with how issue activities handle assignee, project, parent)
 * @param {*} value - The value to normalize
 * @returns {*} Normalized value (ID for refs, original value otherwise)
 */
const normalizeValueForStorage = (value) => {
  if (!value) return value;

  // For populated documents, extract the ID
  if (typeof value === 'object' && value._id) {
    return value._id;
  }

  return value;
};

export const createProjectActivity = async (projectId, userId, action, oldValue, newValue) => {
  const field = deriveFieldFromAction(action);

  const activity = new ProjectActivity({
    project: projectId,
    user: userId,
    action,
    changes: {
      field,
      oldValue: normalizeValueForStorage(oldValue),
      newValue: normalizeValueForStorage(newValue),
    },
  });

  await activity.save();
  return activity;
};
