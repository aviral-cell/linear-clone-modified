import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeamDetail } from '../hooks/useTeamDetail';
import Header from '../components/Header';
import MembersTable from '../components/MembersTable';

const TeamDetailPage = () => {
  const { teamKey } = useParams();
  const navigate = useNavigate();
  const { team, loading } = useTeamDetail(teamKey);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header fallbackText="Team" />
        <div className="px-4 md:px-6 py-4">
          <div className="text-text-secondary text-sm">Loading team...</div>
        </div>
      </div>
    );
  }

  if (!team) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        fallbackText="Teams"
        team={team}
        suffix="Members"
        onTeamClick={() => navigate('/admin/teams')}
      />

      <section aria-label="Team members" className="page-content">
        <MembersTable members={team.members || []} showTeams={false} />
      </section>
    </div>
  );
};

export default TeamDetailPage;
