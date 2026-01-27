import React from 'react';
import { formatDate } from '../utils';
import ProjectProperties from './ProjectProperties';

const ProjectSidebar = ({
  project,
  users,
  teams,
  onUpdate,
  selectedMembers = [],
  onMembersChange,
}) => {
  return (
    <div className="w-full h-full p-6">
      <div className="space-y-6">
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

        <div className="h-px bg-border my-4" />

        <div>
          <label className="block text-xs font-medium text-text-tertiary mb-2 tracking-wide">
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
