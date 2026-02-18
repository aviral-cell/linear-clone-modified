import React from 'react';
import { formatDate } from '../utils';
import { Divider, Label } from './ui';
import ProjectProperties from './ProjectProperties';
import ProjectActivity from './ProjectActivity';

const ProjectSidebar = ({
  project,
  users,
  teams,
  onUpdate,
  selectedMembers = [],
  onMembersChange,
  activitiesRefreshTrigger,
  onSeeAllActivities,
}) => {
  return (
    <div className="sidebar-content">
      <div className="sidebar-content-inner">
        <ProjectProperties
          project={project}
          users={users}
          teams={teams}
          onUpdate={onUpdate}
          variant="vertical"
          showTeam={false}
          showStartDate={true}
          showTargetDate={true}
          showStatus={true}
          showPriority={true}
          showLead={true}
          showMembers={true}
          selectedMembers={selectedMembers}
          onMembersChange={onMembersChange}
        />

        <Divider />

        {project?.identifier && (
          <ProjectActivity
            projectIdentifier={project.identifier}
            users={users}
            refreshTrigger={activitiesRefreshTrigger}
            onSeeAll={onSeeAllActivities}
          />
        )}

        <Divider />

        <div>
          <Label>Created</Label>
          <div className="text-sm text-text-secondary">
            {formatDate(project.createdAt, { relative: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSidebar;
