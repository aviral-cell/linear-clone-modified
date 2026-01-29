import React from 'react';
import { getAvatarColor, formatDate } from '../utils';
import IssueProperties from './IssueProperties';

const IssueSidebar = ({ issue, users, projects = [], onUpdate }) => {
  return (
    <div className="sidebar-content">
      <div className="sidebar-content-inner">
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

        <div className="divider" />

        <div>
          <label className="label">Created by</label>
          <div className="flex items-center gap-2 text-sm text-text-primary">
            <div className={`avatar avatar-md ${getAvatarColor(issue.creator._id)}`}>
              {issue.creator.name.charAt(0)}
            </div>
            <span>{issue.creator.name}</span>
          </div>
        </div>

        <div>
          <label className="label">Created</label>
          <div className="text-sm text-text-secondary">
            {formatDate(issue.createdAt, { relative: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueSidebar;
