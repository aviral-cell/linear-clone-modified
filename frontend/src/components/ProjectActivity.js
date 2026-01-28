import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { baseURL } from '../utils';
import UpdateActivityList from './UpdateActivityList';

const ProjectActivity = ({ projectIdentifier, token, refreshTrigger, onSeeAll }) => {
  const [activities, setActivities] = useState([]);
  const [updateStatusMap, setUpdateStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectIdentifier || !token) return;

      try {
        const [activitiesRes, updatesRes] = await Promise.all([
          fetch(`${baseURL}/api/projects/${projectIdentifier}/activities`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${baseURL}/api/projects/${projectIdentifier}/updates`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        let fetchedActivities = [];
        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          fetchedActivities = activitiesData.activities || [];
          setActivities(fetchedActivities);
        }

        if (updatesRes.ok) {
          const updatesData = await updatesRes.json();
          const updates = updatesData.updates || [];

          const statusMap = {};
          updates.forEach((update) => {
            const updateTime = new Date(update.createdAt).getTime();
            fetchedActivities.forEach((activity) => {
              if (activity.actionType === 'update_posted' && activity.createdAt) {
                const activityTime = new Date(activity.createdAt).getTime();
                const timeDiff = Math.abs(activityTime - updateTime);
                if (timeDiff < 10000) {
                  statusMap[activity._id] = update.status;
                }
              }
            });
          });
          setUpdateStatusMap(statusMap);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectIdentifier, token, refreshTrigger]);

  if (loading) {
    return <div className="text-xs text-text-tertiary">Loading activities...</div>;
  }

  if (activities.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm font-medium text-text-primary flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          Activity
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-tertiary" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
          )}
        </button>
        <button onClick={onSeeAll} className="text-xs text-text-secondary hover:text-text-primary">
          See all
        </button>
      </div>
      {isExpanded && (
        <UpdateActivityList
          activities={activities.slice(0, 5)}
          updateStatusMap={updateStatusMap}
          variant="sidebar"
        />
      )}
    </div>
  );
};

export default ProjectActivity;
