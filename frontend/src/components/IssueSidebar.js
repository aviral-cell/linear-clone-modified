import React from 'react';
import { getAvatarColor, formatDate } from '../utils';
import { Avatar, Divider, Label } from './ui';
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

        <Divider />

        <div>
          <Label>Created by</Label>
          <div className="flex items-center gap-2 text-sm text-text-primary">
            <Avatar size="md" className={getAvatarColor(issue.creator._id)}>
              {issue.creator.name.charAt(0)}
            </Avatar>
            <span>{issue.creator.name}</span>
          </div>
        </div>

        <div>
          <Label>Created</Label>
          <div className="text-sm text-text-secondary">
            {formatDate(issue.createdAt, { relative: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueSidebar;
