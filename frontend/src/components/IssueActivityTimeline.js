import React from 'react';
import { SectionTitle } from './ui';
import ActivityRow from './ActivityRow';
import { normalizeIssueActivity } from '../utils/activityNormalizers';
import { ACTIVITY_LAYOUT } from '../constants';

const IssueActivityTimeline = ({ activities, users = [] }) => {
  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      <SectionTitle as="h3" size="lg" className="mb-4">
        Activity
      </SectionTitle>
      <div className="space-y-4 relative">
        {/* Timeline spine */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

        {activities.map((activity) => (
          <ActivityRow
            key={activity._id}
            item={normalizeIssueActivity(activity, users)}
            layout={ACTIVITY_LAYOUT.TIMELINE}
          />
        ))}
      </div>
    </div>
  );
};

export default IssueActivityTimeline;
