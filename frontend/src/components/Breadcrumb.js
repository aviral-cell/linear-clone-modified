import React, { memo, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeams } from '../context/TeamsContext';
import { getTeamIconDisplay } from '../utils/teamIcons';
import { Button, IconBadge } from './ui';

const Breadcrumb = memo(function Breadcrumb({
  fallbackText = null,
  team = null,
  issueKey = null,
  projectName = null,
  onTeamClick = null,
  menu = null,
}) {
  const { teams, loading } = useTeams();
  const { teamKey } = useParams();
  const navigate = useNavigate();

  const selectedTeam = useMemo(() => {
    if (team) {
      return team;
    }
    if (teamKey && teams.length > 0) {
      return teams.find((t) => t.key === teamKey) || null;
    }
    return null;
  }, [team, teamKey, teams]);

  if (loading) {
    return null;
  }

  if (!selectedTeam) {
    if (fallbackText) {
      return <h2 className="text-base font-medium text-text-primary truncate">{fallbackText}</h2>;
    }
    return null;
  }

  const { IconComponent, colorClass, icon } = getTeamIconDisplay(selectedTeam);

  const handleTeamClick = () => {
    if (onTeamClick) {
      onTeamClick();
    } else if (selectedTeam.key) {
      navigate(`/team/${selectedTeam.key}/all`);
    }
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0">
      <IconBadge size="lg" className={colorClass}>
        {IconComponent ? (
          <IconComponent className="w-4 h-4" />
        ) : (
          <span className="text-sm">{icon}</span>
        )}
      </IconBadge>
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTeamClick}
          className="px-0 py-0 text-base font-medium text-text-primary hover:opacity-70 transition-opacity cursor-pointer leading-normal truncate max-w-[120px] sm:max-w-none"
          title={selectedTeam.name}
        >
          {selectedTeam.name}
        </Button>
        {projectName && (
          <>
            <span className="text-text-tertiary text-base leading-normal flex-shrink-0">›</span>
            <span
              className="text-text-secondary text-sm leading-normal truncate min-w-0"
              title={projectName}
            >
              {projectName}
            </span>
          </>
        )}
        {issueKey && (
          <>
            <span className="text-text-tertiary text-base leading-normal flex-shrink-0">›</span>
            <span className="text-text-secondary font-mono text-sm leading-normal flex-shrink-0">
              {issueKey}
            </span>
          </>
        )}
        {menu}
      </div>
    </nav>
  );
});

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;
