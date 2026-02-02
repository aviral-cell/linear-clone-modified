import React from 'react';
import { Circle, CircleDot, Edit3, Link2 } from '../icons';
import { issueStatusIcons, priorityIcons } from '../constants';
import { getAvatarColor, formatDateTime } from '../utils';
import { ActivityDot, SectionTitle } from './ui';

const getActivityIcon = (action, changes, users = []) => {
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
    return { type: 'assignee', changes, users };
  }

  if (action.includes('parent') || action.includes('parent')) {
    return { Icon: Link2, color: 'text-text-tertiary', type: 'icon' };
  }

  if (action.includes('title') || action.includes('description')) {
    return { Icon: Edit3, color: 'text-text-tertiary', type: 'icon' };
  }

  return { Icon: Edit3, color: 'text-text-tertiary', type: 'icon' };
};

const formatChange = (action, changes, users = []) => {
  const simpleActions = ['updated description', 'updated title', 'added comment'];

  if (simpleActions.some((a) => action.includes(a.replace(' ', '_')))) {
    return null;
  }

  if (!changes) return null;

  const isAssigneeChange = action.includes('assignee') || action.includes('assigned');

  const formatValue = (value) => {
    if (!value || value === 'null' || value === null) {
      return 'None';
    }
    if (typeof value === 'object' && value.name) {
      return value.name;
    }
    if (typeof value === 'object' && value.identifier) {
      return `${value.identifier} ${value.title || ''}`.trim();
    }
    if (typeof value === 'string') {
      if (isAssigneeChange && /^[0-9a-fA-F]{24}$/.test(value)) {
        const user = users.find((u) => u._id === value);
        return user ? user.name : 'User';
      }

      return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }
    return String(value);
  };

  const oldValue = formatValue(changes.oldValue);
  const newValue = formatValue(changes.newValue);

  return (
    <>
      {' '}
      from <span className="text-text-primary font-medium">{oldValue}</span> to{' '}
      <span className="text-text-primary font-medium">{newValue}</span>
    </>
  );
};

const ActivityTimeline = ({ activities, users = [] }) => {
  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      <SectionTitle as="h3" size="lg" className="mb-4">
        Activity
      </SectionTitle>
      <div className="space-y-4 relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

        {activities.map((activity, idx) => {
          const iconData = getActivityIcon(activity.action, activity.changes, users);

          return (
            <div
              key={`activity-${activity._id}-${idx}`}
              className="flex items-start gap-3 relative pl-0"
            >
              {iconData.type === 'assignee'
                ? (() => {
                    const assigneeId = activity.changes?.newValue;

                    if (!assigneeId || assigneeId === 'null' || assigneeId === null) {
                      return (
                        <ActivityDot>
                          <Circle className="w-4 h-4 text-text-primary" />
                        </ActivityDot>
                      );
                    }
                    const assigneeUser = users.find((u) => u._id === assigneeId);
                    if (assigneeUser) {
                      return (
                        <ActivityDot className={getAvatarColor(assigneeUser._id)}>
                          <span className="text-xs font-medium text-white">
                            {assigneeUser.name.charAt(0).toUpperCase()}
                          </span>
                        </ActivityDot>
                      );
                    }

                    return (
                      <ActivityDot>
                        <Circle className="w-4 h-4 text-text-primary" />
                      </ActivityDot>
                    );
                  })()
                : (() => {
                    const IconComponent = iconData.Icon;
                    return (
                      <ActivityDot>
                        <IconComponent className={`w-4 h-4 ${iconData.color}`} />
                      </ActivityDot>
                    );
                  })()}
              <div className="flex-1 pt-0.5 ml-8">
                <p className="text-sm text-text-secondary">
                  <span className="text-text-primary font-medium">{activity.user.name}</span>{' '}
                  {activity.action.replace(/_/g, ' ')}
                  {formatChange(activity.action, activity.changes, users)}
                </p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {formatDateTime(activity.createdAt, { relative: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTimeline;
