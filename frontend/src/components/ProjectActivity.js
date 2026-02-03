import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import ActivityList from './ActivityList';
import { ACTIVITY_LIST_VARIANT } from '../constants';
import { Button, CollapsibleSection } from './ui';

const ProjectActivity = ({ projectIdentifier, users = [], refreshTrigger, onSeeAll }) => {
  const [activities, setActivities] = useState([]);
  const [updateStatusMap, setUpdateStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectIdentifier) return;

      try {
        const [activitiesData, updatesData] = await Promise.all([
          api.projects.getActivities(projectIdentifier),
          api.projects.getUpdates(projectIdentifier),
        ]);

        const fetchedActivities = activitiesData.activities || [];
        setActivities(fetchedActivities);

        const updates = updatesData.updates || [];
        const statusMap = {};
        updates.forEach((update) => {
          const updateTime = new Date(update.createdAt).getTime();
          fetchedActivities.forEach((activity) => {
            if (activity.action === 'posted_update' && activity.createdAt) {
              const activityTime = new Date(activity.createdAt).getTime();
              const timeDiff = Math.abs(activityTime - updateTime);
              if (timeDiff < 10000) {
                statusMap[activity._id] = update.status;
              }
            }
          });
        });
        setUpdateStatusMap(statusMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectIdentifier, refreshTrigger]);

  if (loading) {
    return <div className="text-xs text-text-tertiary">Loading activities...</div>;
  }

  if (activities.length === 0) {
    return null;
  }

  return (
    <CollapsibleSection
      title="Activity"
      expanded={isExpanded}
      onToggle={setIsExpanded}
      actions={
        <Button type="button" variant="ghost" size="sm" onClick={onSeeAll} className="text-xs">
          See all
        </Button>
      }
      headerClassName="text-text-primary font-medium gap-1"
      contentClassName="mt-2"
    >
      <ActivityList
        activities={activities.slice(0, 5)}
        users={users}
        updateStatusMap={updateStatusMap}
        variant={ACTIVITY_LIST_VARIANT.SIDEBAR}
      />
    </CollapsibleSection>
  );
};

export default ProjectActivity;
