import ProjectActivity from '../models/ProjectActivity.js';

const formatStatusLabel = (status) => {
  const statusMap = {
    backlog: 'Backlog',
    planned: 'Planned',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Canceled',
  };
  return statusMap[status] || status;
};

const formatPriorityLabel = (priority) => {
  const priorityMap = {
    no_priority: 'No priority',
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return priorityMap[priority] || priority;
};

const formatDateLabel = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate();
  const daySuffix =
    day === 1 || day === 21 || day === 31
      ? 'st'
      : day === 2 || day === 22
        ? 'nd'
        : day === 3 || day === 23
          ? 'rd'
          : 'th';
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  return `${month} ${day}${daySuffix}`;
};

export const createProjectActivity = async (projectId, userId, actionType, oldValue, newValue) => {
  let description = '';

  switch (actionType) {
    case 'status_changed':
      description = `changed status from ${formatStatusLabel(oldValue)} to ${formatStatusLabel(newValue)}`;
      break;
    case 'priority_changed':
      description = `changed priority from ${formatPriorityLabel(oldValue)} to ${formatPriorityLabel(newValue)}`;
      break;
    case 'target_date_set':
      description = `set target date to ${formatDateLabel(newValue)}`;
      break;
    case 'target_date_cleared':
      description = 'cleared target date';
      break;
    case 'start_date_set':
      description = `set start date to ${formatDateLabel(newValue)}`;
      break;
    case 'start_date_cleared':
      description = 'cleared start date';
      break;
    case 'lead_changed':
      const leadName = typeof newValue === 'object' && newValue?.name ? newValue.name : (newValue || 'Unassigned');
      description = `changed lead to ${leadName}`;
      break;
    case 'lead_cleared':
      description = 'cleared lead';
      break;
    case 'team_changed':
      const teamName = typeof newValue === 'object' && newValue?.name ? newValue.name : (newValue || 'Unassigned');
      description = `changed team to ${teamName}`;
      break;
    case 'members_changed':
      const memberCount = Array.isArray(newValue) ? newValue.length : 0;
      description = `changed members (${memberCount} member${memberCount !== 1 ? 's' : ''})`;
      break;
    case 'name_changed':
      description = `changed name to ${newValue}`;
      break;
    case 'summary_changed':
      description = 'updated summary';
      break;
    case 'update_posted':
      description = 'posted an update';
      break;
    default:
      description = 'updated project';
  }

  const activity = new ProjectActivity({
    project: projectId,
    user: userId,
    actionType,
    oldValue,
    newValue,
    description,
  });

  await activity.save();
  return activity;
};
