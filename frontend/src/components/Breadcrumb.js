import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTeams } from '../context/TeamsContext';
import { getTeamIconDisplay } from '../utils/teamIcons';

const Breadcrumb = ({ fallbackText = null }) => {
  const { teams, loading } = useTeams();
  const { teamKey } = useParams();

  const selectedTeam = useMemo(() => {
    if (teamKey && teams.length > 0) {
      return teams.find((t) => t.key === teamKey) || null;
    }
    return null;
  }, [teamKey, teams]);

  if (loading) {
    return null;
  }

  if (!selectedTeam) {
    if (fallbackText) {
      return <h2 className="text-base font-medium text-text-primary">{fallbackText}</h2>;
    }
    return null;
  }

  const { IconComponent, colorClass, icon } = getTeamIconDisplay(selectedTeam);

  return (
    <>
      <div
        className={`w-6 h-6 ${colorClass} rounded-md flex items-center justify-center text-white flex-shrink-0`}
      >
        {IconComponent ? (
          <IconComponent className="w-4 h-4" />
        ) : (
          <span className="text-sm">{icon}</span>
        )}
      </div>
      <h2 className="text-base font-medium text-text-primary">{selectedTeam.name}</h2>
    </>
  );
};

export default Breadcrumb;
