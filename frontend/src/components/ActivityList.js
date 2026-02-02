import React from 'react';
import ActivityRow from './ActivityRow';
import { normalizeProjectActivity } from '../utils/activityNormalizers';
import { ACTIVITY_LAYOUT, ACTIVITY_LIST_VARIANT } from '../constants';

/**
 * Renders a list of project activities in compact list format
 * Used in project sidebar and project Updates tab
 *
 * @param {Object} props
 * @param {Array} props.activities - Array of project activity objects from API
 * @param {Array} [props.users=[]] - Array of user objects for resolving lead/member names
 * @param {string} [props.updateStatus=null] - Optional update status to apply to all activities (e.g., 'on_track', 'at_risk')
 * @param {Object} [props.updateStatusMap={}] - Map of activity IDs to their update statuses for posted_update icon resolution
 * @param {string} [props.variant='updates'] - Display variant: 'sidebar' (medium size) or 'updates' (small size)
 * @returns {React.ReactElement|null} Rendered activity list or null if no activities
 */
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

  // Build complete updateStatusMap including explicit updateStatus (non-mutating)
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
