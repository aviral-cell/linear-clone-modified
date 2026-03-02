import React from 'react';
import ActivityRow from './ActivityRow';
import { normalizeProjectActivity } from '../utils/activityNormalizers';
import { ACTIVITY_LAYOUT, ACTIVITY_LIST_VARIANT } from '../constants';

const ActivityList = ({
  activities,
  users = [],
  updateStatus = null,
  updateStatusMap = {},
  variant = ACTIVITY_LIST_VARIANT.UPDATES,
}) => {
  if (!activities || activities.length === 0) {
    return null;
  }

  const isSidebar = variant === ACTIVITY_LIST_VARIANT.SIDEBAR;
  const containerClasses = isSidebar ? 'space-y-3' : 'activity-list';
  const size = isSidebar ? 'medium' : 'small';

  const completeUpdateStatusMap =
    updateStatus && activities.length > 0
      ? activities.reduce(
          (acc, activity) => ({
            ...acc,
            [activity._id]: acc[activity._id] || updateStatus,
          }),
          updateStatusMap
        )
      : updateStatusMap;

  return (
    <div className={containerClasses}>
      {activities.map((activity) => (
        <ActivityRow
          key={activity._id}
          item={normalizeProjectActivity(activity, {
            users,
            updateStatusMap: completeUpdateStatusMap,
          })}
          layout={ACTIVITY_LAYOUT.LIST}
          size={size}
        />
      ))}
    </div>
  );
};

export default ActivityList;
