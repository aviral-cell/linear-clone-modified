import React from 'react';
import { getAvatarColor, formatDate } from '../utils';
import IssueProperties from './IssueProperties';

const IssueSidebar = ({ issue, users, projects = [], onUpdate }) => {
  return (
    <div className="w-full h-full p-6">
      <div className="space-y-6">
        <IssueProperties
          issue={issue}
          users={users}
          projects={projects}
          onUpdate={onUpdate}
          variant="vertical"
          showStatus={true}
          showPriority={true}
          showAssignee={true}
          showProject={true}
        />

        <div className="h-px bg-border my-4" />

        <div>
          <label className="block text-xs font-medium text-text-tertiary mb-2 tracking-wide">
            Created by
          </label>
          <div className="flex items-center gap-2 text-sm text-text-primary">
            <div
              className={`w-5 h-5 ${getAvatarColor(issue.creator._id)} rounded-full flex items-center justify-center text-xs text-white font-medium`}
            >
              {issue.creator.name.charAt(0)}
            </div>
            <span>{issue.creator.name}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-tertiary mb-2 tracking-wide">
            Created
          </label>
          <div className="text-sm text-text-secondary">
            {formatDate(issue.createdAt, { relative: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueSidebar;
