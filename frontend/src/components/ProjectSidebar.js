import React from 'react';
import { formatDate } from '../utils';
import ProjectProperties from './ProjectProperties';
import ProjectActivity from './ProjectActivity';

const ProjectSidebar = ({
  project,
  users,
  teams,
  onUpdate,
  selectedMembers = [],
  onMembersChange,
  token,
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
          showTeam={true}
          showStartDate={true}
          showTargetDate={true}
          showStatus={true}
          showPriority={true}
          showLead={true}
          showMembers={true}
          selectedMembers={selectedMembers}
          onMembersChange={onMembersChange}
        />

        <div className="divider" />

        {project?.identifier && token && (
          <ProjectActivity
            projectIdentifier={project.identifier}
            token={token}
            refreshTrigger={activitiesRefreshTrigger}
            onSeeAll={onSeeAllActivities}
          />
        )}

        <div className="divider" />

        <div>
          <label className="label">
            Created
          </label>
          <div className="text-sm text-text-secondary">
            {formatDate(project.createdAt, { relative: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSidebar;
