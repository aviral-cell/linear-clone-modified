import {
  CircleDot,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  TrendingDown,
  CalendarClock,
  CalendarCheck2,
  User,
  Users,
  Building2,
  Edit,
} from '../icons';
import { projectStatusIcons, priorityIcons } from '../constants';

export { projectStatusIcons, priorityIcons };

/**
 * Format status value to human-readable label
 */
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

/**
 * Format priority value to human-readable label
 */
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

/**
 * Format date value to human-readable label
 */
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

/**
 * Get icon configuration for project activities
 * Uses unified shape: action instead of actionType, activityValue from changes.newValue
 * @param {string} action - Activity action (e.g., 'updated_status', 'posted_update')
 * @param {string|null} updateStatus - Update status for posted_update actions
 * @param {*} activityValue - The newValue from changes (for status/priority icons)
 * @returns {Object} Icon configuration with Icon component and color class
 */
export const getActivityIcon = (action, updateStatus = null, activityValue = null) => {
  switch (action) {
    case 'updated_status':
      if (activityValue && projectStatusIcons[activityValue]) {
        return projectStatusIcons[activityValue];
      }
      return { Icon: CircleDot, color: 'text-yellow-400' };
    case 'updated_priority':
      if (activityValue && priorityIcons[activityValue]) {
        return priorityIcons[activityValue];
      }
      return {
        Icon: priorityIcons.high?.Icon || priorityIcons.no_priority.Icon,
        color: 'text-text-tertiary',
      };
    case 'posted_update':
      if (updateStatus === 'on_track') {
        return { Icon: TrendingUp, color: 'text-green-400' };
      }
      if (updateStatus === 'at_risk') {
        return { Icon: AlertCircle, color: 'text-yellow-400' };
      }
      if (updateStatus === 'off_track') {
        return { Icon: TrendingDown, color: 'text-red-400' };
      }
      return { Icon: CheckCircle2, color: 'text-yellow-400' };
    case 'set_start_date':
    case 'cleared_start_date':
      return { Icon: CalendarClock, color: 'text-text-tertiary' };
    case 'set_target_date':
    case 'cleared_target_date':
      return { Icon: CalendarCheck2, color: 'text-text-tertiary' };
    case 'updated_lead':
    case 'cleared_lead':
      return { Icon: User, color: 'text-text-tertiary' };
    case 'updated_team':
      return { Icon: Building2, color: 'text-text-tertiary' };
    case 'updated_members':
      return { Icon: Users, color: 'text-text-tertiary' };
    case 'updated_name':
    case 'updated_summary':
      return { Icon: Edit, color: 'text-text-tertiary' };
    default:
      return { Icon: CircleDot, color: 'text-yellow-400' };
  }
};

/**
 * Resolve a user ID to a user name using the users list
 * @param {string} userId - User ID (24-char hex string)
 * @param {Array} users - Array of user objects
 * @returns {string} User name or fallback
 */
const resolveUserName = (userId, users = []) => {
  if (!userId) return 'Unassigned';
  if (typeof userId === 'object' && userId.name) return userId.name;
  if (typeof userId === 'string' && /^[0-9a-fA-F]{24}$/.test(userId)) {
    const user = users.find((u) => u._id === userId);
    return user ? user.name : 'User';
  }
  return userId || 'Unassigned';
};

/**
 * Build project activity message from action and changes
 * Messages are built in the UI from action and changes (no backend description)
 * Lead/team values are resolved using the users list (consistent with issue activity assignee resolution)
 * @param {Object} activity - Activity object with action and changes
 * @param {Array} users - Array of user objects for resolving lead names
 * @returns {React.ReactNode} Formatted message with bold spans
 */
export const buildProjectActivityMessage = (activity, users = []) => {
  const { action, changes } = activity;
  const oldValue = changes?.oldValue;
  const newValue = changes?.newValue;

  switch (action) {
    case 'updated_status':
      return (
        <>
          changed status from <span className="font-medium">{formatStatusLabel(oldValue)}</span> to{' '}
          <span className="font-medium">{formatStatusLabel(newValue)}</span>
        </>
      );

    case 'updated_priority':
      return (
        <>
          changed priority from <span className="font-medium">{formatPriorityLabel(oldValue)}</span>{' '}
          to <span className="font-medium">{formatPriorityLabel(newValue)}</span>
        </>
      );

    case 'set_target_date':
      return (
        <>
          set target date to <span className="font-medium">{formatDateLabel(newValue)}</span>
        </>
      );

    case 'cleared_target_date':
      return 'cleared target date';

    case 'set_start_date':
      return (
        <>
          set start date to <span className="font-medium">{formatDateLabel(newValue)}</span>
        </>
      );

    case 'cleared_start_date':
      return 'cleared start date';

    case 'updated_lead': {
      // Resolve lead ID to name using users list (consistent with assignee resolution)
      const leadName = resolveUserName(newValue, users);
      return (
        <>
          changed lead to <span className="font-medium">{leadName}</span>
        </>
      );
    }

    case 'cleared_lead':
      return 'cleared lead';

    case 'updated_team': {
      // Team is stored as name string from populated document
      const teamName =
        typeof newValue === 'object' && newValue?.name ? newValue.name : newValue || 'Unassigned';
      return (
        <>
          changed team to <span className="font-medium">{teamName}</span>
        </>
      );
    }

    case 'updated_members': {
      const memberCount = Array.isArray(newValue) ? newValue.length : 0;
      return (
        <>
          changed members{' '}
          <span className="font-medium">
            ({memberCount} member{memberCount !== 1 ? 's' : ''})
          </span>
        </>
      );
    }

    case 'updated_name':
      return (
        <>
          changed name to <span className="font-medium">{newValue}</span>
        </>
      );

    case 'updated_summary':
      return 'updated summary';

    case 'posted_update':
      return 'posted an update';

    default:
      return 'updated project';
  }
};

// Keep backward compatibility alias
export const formatDescriptionWithBold = buildProjectActivityMessage;
