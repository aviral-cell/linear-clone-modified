import React from 'react';
import { SectionTitle } from './ui';
import ActivityRow from './ActivityRow';
import { normalizeIssueActivity } from '../utils/activityNormalizers';
import { ACTIVITY_LAYOUT } from '../constants';

/**
 * IssueActivityTimeline component for displaying issue activity history
 * @param {Object} props
 * @param {Array} props.activities - Array of activity objects
 * @param {Array} props.users - Array of user objects for assignee resolution
 * @param {Array} props.projects - Array of project objects for project resolution
 * @param {Array} props.parentIssues - Array of parent issue objects for parent resolution
 */
const IssueActivityTimeline = ({ activities, users = [], projects = [], parentIssues = [] }) => {
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
            item={normalizeIssueActivity(activity, { users, projects, parentIssues })}
            layout={ACTIVITY_LAYOUT.TIMELINE}
          />
        ))}
      </div>
    </div>
  );
};

export default IssueActivityTimeline;
