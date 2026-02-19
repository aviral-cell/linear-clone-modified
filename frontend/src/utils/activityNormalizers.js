import { Circle, CircleDot, Edit3 } from '../icons';
import { issueStatusIcons, priorityIcons, ACTIVITY_DATE_FORMAT } from '../constants';
import { getAvatarColor } from '../utils';
import {
  getActivityIcon as getProjectActivityIcon,
  buildProjectActivityMessage,
} from './projectActivityUtils';

const toDisplayAction = (action) => {
  return action.replace(/_/g, ' ');
};

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

const buildIssueActivityMessage = (action, changes, options = {}) => {
  const { users = [], projects = [], parentIssues = [] } = options;
  const actionText = toDisplayAction(action);

  const simpleActions = ['updated_description', 'updated_title', 'added_comment', 'updated_comment', 'deleted_comment'];
  if (simpleActions.some((a) => action.includes(a))) {
    return actionText;
  }

  if (!changes) return actionText;

  const isAssigneeChange = action.includes('assignee') || action.includes('assigned');
  const isProjectChange = changes.field === 'project';
  const isParentChange = changes.field === 'parent';

  const formatValue = (value) => {
    if (!value || value === 'null' || value === null) {
      return 'None';
    }
    if (typeof value === 'object' && value.name) {
      return value.name;
    }
    if (typeof value === 'object' && value.identifier) {
      return value.identifier;
    }
    if (typeof value === 'string') {
      if (isAssigneeChange && /^[0-9a-fA-F]{24}$/.test(value)) {
        const user = users.find((u) => u._id === value);
        return user ? user.name : 'User';
      }

      if (isProjectChange && /^[0-9a-fA-F]{24}$/.test(value)) {
        const project = projects.find((p) => p._id === value);
        return project ? project.name || project.identifier : 'Unknown project';
      }

      if (isParentChange && /^[0-9a-fA-F]{24}$/.test(value)) {
        const parent = parentIssues.find((p) => p._id === value);
        return parent ? parent.identifier || parent.title : 'Unknown issue';
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

export const normalizeIssueActivity = (activity, usersOrOptions = [], additionalOptions = {}) => {
  let options;
  if (Array.isArray(usersOrOptions)) {
    options = { users: usersOrOptions, ...additionalOptions };
  } else {
    options = usersOrOptions;
  }

  const { users = [], projects = [], parentIssues = [] } = options;

  const icon = getIssueActivityIcon(activity.action, activity.changes, users);
  const message = buildIssueActivityMessage(activity.action, activity.changes, {
    users,
    projects,
    parentIssues,
  });

  return {
    user: activity.user,
    message,
    icon,
    createdAt: activity.createdAt,
    dateFormat: ACTIVITY_DATE_FORMAT.RELATIVE,
  };
};

export const normalizeProjectActivity = (activity, optionsOrUpdateStatusMap = {}) => {
  let options;
  if (
    optionsOrUpdateStatusMap &&
    typeof optionsOrUpdateStatusMap === 'object' &&
    !Array.isArray(optionsOrUpdateStatusMap)
  ) {
    if ('users' in optionsOrUpdateStatusMap || 'updateStatusMap' in optionsOrUpdateStatusMap) {
      options = optionsOrUpdateStatusMap;
    } else {
      options = { users: [], updateStatusMap: optionsOrUpdateStatusMap };
    }
  } else {
    options = { users: [], updateStatusMap: {} };
  }

  const { users = [], updateStatusMap = {} } = options;
  const activityUpdateStatus = updateStatusMap[activity._id] || null;
  const { Icon, color } = getProjectActivityIcon(
    activity.action,
    activityUpdateStatus,
    activity.changes?.newValue
  );

  return {
    user: activity.user,
    message: buildProjectActivityMessage(activity, users),
    icon: {
      type: 'icon',
      Icon,
      color,
    },
    createdAt: activity.createdAt,
    dateFormat: ACTIVITY_DATE_FORMAT.ABSOLUTE,
  };
};
