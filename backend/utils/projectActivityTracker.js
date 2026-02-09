import ProjectActivity from '../models/ProjectActivity.js';

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

const normalizeValueForStorage = (value) => {
  if (!value) return value;

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
