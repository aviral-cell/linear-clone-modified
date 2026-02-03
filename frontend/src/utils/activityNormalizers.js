import { Circle, CircleDot, Edit3 } from '../icons';
import { issueStatusIcons, priorityIcons, ACTIVITY_DATE_FORMAT } from '../constants';
import { getAvatarColor } from '../utils';
import {
  getActivityIcon as getProjectActivityIcon,
  formatDescriptionWithBold,
} from './projectActivityUtils';

/**
 * Normalized activity item shape for shared ActivityRow component
 *
 * @typedef {Object} NormalizedActivityItem
 * @property {Object} user - User who performed the action
 * @property {string} user.name - User's display name
 * @property {string} [user._id] - User ID for avatar resolution
 * @property {string|React.ReactNode} message - Activity message (plain or with bold segments)
 * @property {Object} icon - Icon configuration for the activity
 * @property {'icon'|'avatar'} icon.type - Type of display (icon or avatar)
 * @property {React.Component} [icon.Icon] - Icon component (when type='icon')
 * @property {string} [icon.color] - Icon color class (when type='icon')
 * @property {string} [icon.userId] - User ID for avatar (when type='avatar')
 * @property {string} [icon.avatarColor] - Avatar color class (when type='avatar')
 * @property {string} [icon.initial] - User initial for avatar (when type='avatar')
 * @property {string} createdAt - ISO date string
 * @property {'relative'|'absolute'} dateFormat - Date format preference
 */

/**
 * Convert action string to display format
 * Replaces underscores with spaces for human-readable text
 * @param {string} action - Action string (e.g., 'updated_status')
 * @returns {string} Display-friendly action text (e.g., 'updated status')
 */
const toDisplayAction = (action) => {
  return action.replace(/_/g, ' ');
};

/**
 * Get icon configuration for issue activities
 * @param {string} action - Issue action type
 * @param {Object} changes - Changes object with field, oldValue, newValue
 * @param {Array} users - Array of user objects
 * @returns {Object} Icon configuration
 */
const getIssueActivityIcon = (action, changes, users = []) => {
  if (action.includes('priority')) {
    const newPriority =
      changes?.newValue || changes?.field === 'priority' ? changes?.newValue : null;
    if (newPriority && priorityIcons[newPriority]) {
      return { ...priorityIcons[newPriority], type: 'icon' };
    }
    return { Icon: priorityIcons.medium.Icon, color: 'text-orange-500', type: 'icon' };
  }

  if (action.includes('status')) {
    let newStatus = null;
    if (changes?.newValue) {
      newStatus = changes.newValue;
    } else if (changes?.field === 'status' && changes?.newValue) {
      newStatus = changes.newValue;
    } else {
      const statusMatch = action.match(/status_to_(\w+)/);
      if (statusMatch) {
        newStatus = statusMatch[1];
      } else if (action === 'updated_status' && changes?.newValue) {
        newStatus = changes.newValue;
      }
    }

    if (newStatus && issueStatusIcons[newStatus]) {
      return { ...issueStatusIcons[newStatus], type: 'icon' };
    }

    return { Icon: CircleDot, color: 'text-yellow-500', type: 'icon' };
  }

  if (action.includes('assignee') || action.includes('assigned')) {
    const assigneeId = changes?.newValue;

    if (!assigneeId || assigneeId === 'null' || assigneeId === null) {
      return {
        type: 'icon',
        Icon: Circle,
        color: 'text-text-primary',
      };
    }

    const assigneeUser = users.find((u) => u._id === assigneeId);
    if (assigneeUser) {
      return {
        type: 'avatar',
        userId: assigneeUser._id,
        avatarColor: getAvatarColor(assigneeUser._id),
        initial: assigneeUser.name.charAt(0).toUpperCase(),
      };
    }

    return {
      type: 'icon',
      Icon: Circle,
      color: 'text-text-primary',
    };
  }

  if (action.includes('title') || action.includes('description')) {
    return { Icon: Edit3, color: 'text-text-tertiary', type: 'icon' };
  }

  return { Icon: Edit3, color: 'text-text-tertiary', type: 'icon' };
};

/**
 * Build message text for issue activities
 * @param {string} action - Issue action type
 * @param {Object} changes - Changes object
 * @param {Array} users - Array of user objects
 * @returns {React.ReactNode} Message with optional formatted change
 */
const buildIssueActivityMessage = (action, changes, users = []) => {
  const actionText = toDisplayAction(action);

  const simpleActions = ['updated_description', 'updated_title', 'added_comment'];
  if (simpleActions.some((a) => action.includes(a))) {
    return actionText;
  }

  if (!changes) return actionText;

  const isAssigneeChange = action.includes('assignee') || action.includes('assigned');

  const formatValue = (value) => {
    if (!value || value === 'null' || value === null) {
      return 'None';
    }
    if (typeof value === 'object' && value.name) {
      return value.name;
    }
    if (typeof value === 'string') {
      if (isAssigneeChange && /^[0-9a-fA-F]{24}$/.test(value)) {
        const user = users.find((u) => u._id === value);
        return user ? user.name : 'User';
      }

      return toDisplayAction(value).replace(/\b\w/g, (l) => l.toUpperCase());
    }
    return String(value);
  };

  const oldValue = formatValue(changes.oldValue);
  const newValue = formatValue(changes.newValue);

  return (
    <>
      {actionText} from <span className="text-text-primary font-medium">{oldValue}</span> to{' '}
      <span className="text-text-primary font-medium">{newValue}</span>
    </>
  );
};

/**
 * Normalize an issue activity into the shared activity item format
 * @param {Object} activity - Issue activity object
 * @param {Array} users - Array of user objects for resolution
 * @returns {NormalizedActivityItem} Normalized activity item
 */
export const normalizeIssueActivity = (activity, users = []) => {
  const icon = getIssueActivityIcon(activity.action, activity.changes, users);
  const message = buildIssueActivityMessage(activity.action, activity.changes, users);

  return {
    user: activity.user,
    message,
    icon,
    createdAt: activity.createdAt,
    dateFormat: ACTIVITY_DATE_FORMAT.RELATIVE,
  };
};

/**
 * Normalize a project activity into the shared activity item format
 * @param {Object} activity - Project activity object
 * @param {Object} updateStatusMap - Map of activity IDs to update statuses (for posted_update icons)
 * @returns {NormalizedActivityItem} Normalized activity item
 */
export const normalizeProjectActivity = (activity, updateStatusMap = {}) => {
  const activityUpdateStatus = updateStatusMap[activity._id] || null;
  const { Icon, color } = getProjectActivityIcon(
    activity.actionType,
    activityUpdateStatus,
    activity.newValue
  );

  return {
    user: activity.user,
    message: formatDescriptionWithBold(activity),
    icon: {
      type: 'icon',
      Icon,
      color,
    },
    createdAt: activity.createdAt,
    dateFormat: ACTIVITY_DATE_FORMAT.ABSOLUTE,
  };
};
