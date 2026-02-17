import React from 'react';
import { Avatar, DataTable } from './ui';
import { getAvatarColor } from '../utils';

const GRID_WITH_TEAMS =
  'grid-cols-[18px_minmax(180px,2fr)_minmax(180px,2fr)_minmax(80px,auto)_minmax(80px,auto)_minmax(90px,auto)_12px]';

const GRID_WITHOUT_TEAMS =
  'grid-cols-[18px_minmax(180px,2fr)_minmax(180px,2fr)_minmax(80px,auto)_minmax(90px,auto)_12px]';

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const RoleChip = ({ role }) =>
  role === 'admin' ? (
    <span className="text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded">
      Admin
    </span>
  ) : (
    <span className="text-[10px] font-medium text-text-secondary bg-background-tertiary px-1.5 py-0.5 rounded">
      Member
    </span>
  );

const MembersTable = ({ members, showTeams = true }) => {
  const columns = [
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
      render: (user) => (
        <div className="flex items-center gap-2 min-w-0">
          <Avatar size="md" className={`${getAvatarColor(user._id)} text-[11px] font-medium`}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <span className="text-table-cell font-normal text-text-primary truncate">
            {user.name}
          </span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (user) => (
        <span className="text-table-cell font-normal text-text-secondary truncate">
          {user.email}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => <RoleChip role={user.role} />,
    },
    ...(showTeams
      ? [
          {
            key: 'teams',
            label: 'Teams',
            render: (user) => (
              <span className="text-table-cell font-normal text-text-secondary">
                {user.teamCount ?? 0} {user.teamCount === 1 ? 'team' : 'teams'}
              </span>
            ),
          },
        ]
      : []),
    {
      key: 'joined',
      label: 'Joined',
      render: (user) => (
        <span className="text-table-cell font-normal text-text-secondary">
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      key: 'spacer-end',
      ariaLabel: '',
      render: () => null,
    },
  ];

  return (
    <DataTable
      data={members}
      getRowKey={(user) => user._id}
      gridTemplateClass={showTeams ? GRID_WITH_TEAMS : GRID_WITHOUT_TEAMS}
      rowClassName="py-0"
      columns={columns}
    />
  );
};

export default MembersTable;
