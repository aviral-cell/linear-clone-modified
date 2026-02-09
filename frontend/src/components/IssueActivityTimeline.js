import React from 'react';
import { Button, SectionTitle } from './ui';
import ActivityRow from './ActivityRow';
import { normalizeIssueActivity } from '../utils/activityNormalizers';
import { ACTIVITY_LAYOUT } from '../constants';
import { Bell, BellOff } from '../icons';

const IssueActivityTimeline = ({
  activities,
  users = [],
  projects = [],
  parentIssues = [],
  isSubscribed = false,
  onToggleSubscribe,
}) => {
  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle as="h3" size="lg">
          Activity
        </SectionTitle>
        {onToggleSubscribe && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSubscribe}
            title={isSubscribed ? 'Unsubscribe from issue' : 'Subscribe to issue'}
            className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary"
          >
            {isSubscribed ? (
              <BellOff className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            <span>{isSubscribed ? 'Unsubscribe' : 'Subscribe'}</span>
          </Button>
        )}
      </div>

      {activities.length > 0 && (
        <div className="space-y-4 relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

          {activities.map((activity) => (
            <ActivityRow
              key={activity._id}
              item={normalizeIssueActivity(activity, { users, projects, parentIssues })}
              layout={ACTIVITY_LAYOUT.TIMELINE}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default IssueActivityTimeline;
