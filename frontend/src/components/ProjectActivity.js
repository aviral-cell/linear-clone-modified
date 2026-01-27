import React, { useEffect, useState } from 'react';
import {
  CircleDot,
  CheckCircle2,
  BarChart4,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { baseURL } from '../utils';
import { formatDate } from '../utils';

const getActivityIcon = (actionType) => {
  switch (actionType) {
    case 'status_changed':
      return { Icon: CircleDot, color: 'text-yellow-400' };
    case 'priority_changed':
      return { Icon: BarChart4, color: 'text-text-tertiary' };
    case 'target_date_set':
    case 'target_date_cleared':
    case 'start_date_set':
    case 'start_date_cleared':
      return { Icon: Calendar, color: 'text-text-tertiary' };
    case 'update_posted':
      return { Icon: CheckCircle2, color: 'text-yellow-400' };
    default:
      return { Icon: CircleDot, color: 'text-yellow-400' };
  }
};

const formatActivityDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
};

const ProjectActivity = ({ projectIdentifier, token, refreshTrigger }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!projectIdentifier || !token) return;

      try {
        const response = await fetch(`${baseURL}/api/projects/${projectIdentifier}/activities`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [projectIdentifier, token, refreshTrigger]);

  if (loading) {
    return (
      <div className="text-xs text-text-tertiary">Loading activities...</div>
    );
  }

  if (activities.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary flex items-center gap-1">
          Activity
          <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
        </h3>
        <button className="text-xs text-text-secondary hover:text-text-primary">
          See all
        </button>
      </div>
      <div className="space-y-3">
        {activities.slice(0, 5).map((activity) => {
          const { Icon, color } = getActivityIcon(activity.actionType);
          return (
            <div key={activity._id} className="flex items-start gap-2">
              <div className={`w-4 h-4 ${color} flex-shrink-0 mt-0.5`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary">
                  <span className="text-text-primary font-medium">
                    {activity.user?.name || 'Unknown'}
                  </span>{' '}
                  {activity.description}
                  <span className="text-text-tertiary"> · {formatActivityDate(activity.createdAt)}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectActivity;
