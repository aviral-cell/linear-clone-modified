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
    case 'updated_status':
      description = `changed status from ${formatStatusLabel(oldValue)} to ${formatStatusLabel(newValue)}`;
      break;
    case 'updated_priority':
      description = `changed priority from ${formatPriorityLabel(oldValue)} to ${formatPriorityLabel(newValue)}`;
      break;
    case 'set_target_date':
      description = `set target date to ${formatDateLabel(newValue)}`;
      break;
    case 'cleared_target_date':
      description = 'cleared target date';
      break;
    case 'set_start_date':
      description = `set start date to ${formatDateLabel(newValue)}`;
      break;
    case 'cleared_start_date':
      description = 'cleared start date';
      break;
    case 'updated_lead':
      const leadName = typeof newValue === 'object' && newValue?.name ? newValue.name : (newValue || 'Unassigned');
      description = `changed lead to ${leadName}`;
      break;
    case 'cleared_lead':
      description = 'cleared lead';
      break;
    case 'updated_team':
      const teamName = typeof newValue === 'object' && newValue?.name ? newValue.name : (newValue || 'Unassigned');
      description = `changed team to ${teamName}`;
      break;
    case 'updated_members':
      const memberCount = Array.isArray(newValue) ? newValue.length : 0;
      description = `changed members (${memberCount} member${memberCount !== 1 ? 's' : ''})`;
      break;
    case 'updated_name':
      description = `changed name to ${newValue}`;
      break;
    case 'updated_summary':
      description = 'updated summary';
      break;
    case 'posted_update':
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
