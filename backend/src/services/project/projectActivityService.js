import ProjectActivity from '../../models/ProjectActivity.js';

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

export const getProjectActivities = async (projectId, options = {}) => {
  const { limit = 50, skip = 0 } = options;

  const activities = await ProjectActivity.find({ project: projectId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  return activities;
};

export const groupActivitiesWithUpdates = (updates, activities, project) => {
  const groupedUpdates = updates.map((update) => ({
    update,
    activities: [],
  }));

  let pendingActivities = [];

  if (groupedUpdates.length > 0 && activities.length > 0) {
    for (let i = 0; i < groupedUpdates.length; i += 1) {
      const currentUpdate = groupedUpdates[i].update;
      const previousUpdate = i < groupedUpdates.length - 1 ? groupedUpdates[i + 1].update : null;

      const startTime = previousUpdate ? previousUpdate.createdAt : project.createdAt;
      const endTime = new Date(currentUpdate.createdAt);
      const endTimeWithBuffer = new Date(endTime.getTime() + 10000);

      const windowActivities = activities.filter((activity) => {
        if (!activity.createdAt) return false;
        if (activity.action === 'posted_update') return false;
        const activityTime = new Date(activity.createdAt);
        return activityTime > startTime && activityTime <= endTimeWithBuffer;
      });

      windowActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      groupedUpdates[i].activities = windowActivities;
    }

    const latestUpdate = groupedUpdates[0].update;
    const latestUpdateTime = new Date(latestUpdate.createdAt);
    const latestUpdateTimeWithBuffer = new Date(latestUpdateTime.getTime() + 10000);

    pendingActivities = activities.filter((activity) => {
      if (!activity.createdAt) return false;
      if (activity.action === 'posted_update') return false;
      const activityTime = new Date(activity.createdAt);
      return activityTime > latestUpdateTimeWithBuffer;
    });

    pendingActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (activities.length > 0) {
    pendingActivities = activities;
    pendingActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return {
    updates: groupedUpdates.map((item) => ({
      ...item.update.toObject(),
      activities: item.activities,
    })),
    pendingActivities,
  };
};
