import React, { memo, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeams } from '../context/TeamsContext';
import { TeamDisplay } from './ui';

const Breadcrumb = memo(function Breadcrumb({
  fallbackText = null,
  team = null,
  issueKey = null,
  projectName = null,
  suffix = null,
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

  const handleTeamClick = () => {
    if (onTeamClick) {
      onTeamClick();
    } else if (selectedTeam.key) {
      navigate(`/team/${selectedTeam.key}/all`);
    }
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 min-w-0">
      {fallbackText && onTeamClick && (
        <>
          <button
            type="button"
            onClick={onTeamClick}
            className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer truncate"
          >
            {fallbackText}
          </button>
          <span className="text-text-tertiary text-base leading-normal flex-shrink-0">›</span>
        </>
      )}
      <TeamDisplay
        team={selectedTeam}
        size="lg"
        label={selectedTeam.name}
        labelClassName={
          fallbackText && onTeamClick
            ? 'text-base font-medium text-text-primary leading-normal truncate max-w-[120px] sm:max-w-none'
            : 'text-base font-medium text-text-primary hover:opacity-70 transition-opacity cursor-pointer leading-normal truncate max-w-[120px] sm:max-w-none'
        }
        onClick={fallbackText && onTeamClick ? undefined : handleTeamClick}
      />
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
      {suffix && (
        <>
          <span className="text-text-tertiary text-base leading-normal flex-shrink-0">›</span>
          <span className="text-text-secondary text-sm leading-normal flex-shrink-0">{suffix}</span>
        </>
      )}
      {menu}
    </nav>
  );
});

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;
