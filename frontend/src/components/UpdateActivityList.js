import React from 'react';
import {
  getActivityIcon,
  formatDescriptionWithBold,
  formatActivityDate,
} from '../utils/activityUtils';

const UpdateActivityList = ({
  activities,
  updateStatus = null,
  updateStatusMap = {},
  variant = 'updates',
}) => {
  if (!activities || activities.length === 0) {
    return null;
  }

  const isSidebar = variant === 'sidebar';
  const containerClasses = isSidebar
    ? 'space-y-3'
    : 'mt-2 mb-4 pl-4 border-l border-border space-y-2';
  const iconSize = isSidebar ? 'w-4 h-4' : 'w-3 h-3';
  const iconContainerSize = isSidebar ? 'w-4 h-4' : 'w-3 h-3';
  const usernameClasses = isSidebar ? 'text-text-primary font-medium' : 'text-text-primary';

  return (
    <div className={containerClasses}>
      {activities.map((activity) => {
        const activityUpdateStatus = updateStatusMap[activity._id] || updateStatus;
        const { Icon, color } = getActivityIcon(
          activity.actionType,
          activityUpdateStatus,
          activity.newValue
        );
        return (
          <div key={activity._id} className="flex items-start gap-2">
            <div className={`${iconContainerSize} ${color} flex-shrink-0 mt-0.5`}>
              <Icon className={iconSize} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-secondary">
                <span className={usernameClasses}>{activity.user?.name || 'Unknown'}</span>{' '}
                {formatDescriptionWithBold(activity)}
                <span className="text-text-tertiary">
                  {' '}
                  · {formatActivityDate(activity.createdAt)}
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UpdateActivityList;
