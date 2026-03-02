import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeams } from '../context/TeamsContext';
import Header from '../components/Header';
import { DataTable, TeamDisplay } from '../components/ui';
import { Users } from '../icons';

const TABLE_GRID_CLASS =
  'grid-cols-[18px_minmax(200px,2fr)_minmax(90px,auto)_minmax(90px,auto)_12px]';

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TeamsPage = () => {
  const navigate = useNavigate();
  const { teams, loading } = useTeams();

  const handleRowClick = useCallback(
    (team) => {
      navigate(`/admin/team/${team.key}/members`);
    },
    [navigate]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header fallbackText="Teams" />

      <section aria-label="Teams list" className="page-content">
        {loading ? (
          <div className="px-4 md:px-6 py-4">
            <div className="text-text-secondary text-sm">Loading teams...</div>
          </div>
        ) : (
          <DataTable
            data={teams}
            onRowClick={handleRowClick}
            getRowKey={(team) => team._id}
            gridTemplateClass={TABLE_GRID_CLASS}
            rowClassName="py-0"
            columns={[
              {
                key: 'spacer',
                ariaLabel: '',
                headerClassName: 'pr-4 md:pr-6',
                cellClassName: 'pr-4 md:pr-6',
                render: () => null,
              },
              {
                key: 'name',
                label: 'Name',
                render: (team) => (
                  <TeamDisplay team={team} size="md" label={team.name} suffix={team.key} />
                ),
              },
              {
                key: 'members',
                label: 'Members',
                render: (team) => (
                  <span className="flex items-center gap-1.5 text-table-cell font-normal text-text-secondary">
                    <Users className="w-3.5 h-3.5 text-text-tertiary" />
                    {team.members?.length || 0}
                  </span>
                ),
              },
              {
                key: 'created',
                label: 'Created',
                render: (team) => (
                  <span className="text-table-cell font-normal text-text-secondary">
                    {formatDate(team.createdAt)}
                  </span>
                ),
              },
              {
                key: 'spacer-end',
                ariaLabel: '',
                render: () => null,
              },
            ]}
          />
        )}
      </section>
    </div>
  );
};

export default TeamsPage;
