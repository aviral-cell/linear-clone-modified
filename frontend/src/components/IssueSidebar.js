import React from 'react';
import { getAvatarColor, formatDate } from '../utils';
import { Avatar, Divider, Label } from './ui';
import IssueProperties from './IssueProperties';
import { Trash2 } from '../icons';

const IssueSidebar = ({ issue, users, projects = [], parentIssues = [], onUpdate, onDelete }) => {
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
          showParent={true}
          parentIssues={parentIssues}
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

        <Divider />

        <button
          onClick={onDelete}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors w-full"
        >
          <Trash2 className="w-4 h-4" />
          Delete issue
        </button>
      </div>
    </div>
  );
};

export default IssueSidebar;
