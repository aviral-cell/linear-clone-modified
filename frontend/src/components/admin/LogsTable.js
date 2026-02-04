import React from 'react';
import { DataTable } from '../ui';
import StatusBadge, { MethodBadge } from './StatusBadge';
import { cn } from '../../utils/cn';

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const ResponseTime = ({ time, isSlow }) => (
  <span className={cn('font-mono text-xs', isSlow && 'text-orange-400 font-semibold')}>
    {time}ms {isSlow && <span title="Slow request">!</span>}
  </span>
);

const LogsTable = ({ logs, onLogClick, className }) => {
  const columns = [
    {
      key: 'timestamp',
      label: 'Time',
      headerClassName: 'text-left',
      cellClassName: 'text-text-secondary',
      render: (row) => (
        <span className="font-mono text-xs">{formatTimestamp(row.timestamp)}</span>
      ),
    },
    {
      key: 'method',
      label: 'Method',
      headerClassName: 'text-left',
      render: (row) => <MethodBadge method={row.method} />,
    },
    {
      key: 'path',
      label: 'Path',
      headerClassName: 'text-left',
      cellClassName: 'max-w-[300px] truncate',
      render: (row) => (
        <span className="font-mono text-xs text-text-primary" title={row.path}>
          {row.path}
        </span>
      ),
    },
    {
      key: 'statusCode',
      label: 'Status',
      headerClassName: 'text-left',
      render: (row) => <StatusBadge statusCode={row.statusCode} />,
    },
    {
      key: 'responseTime',
      label: 'Time',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (row) => <ResponseTime time={row.responseTime} isSlow={row.isSlow} />,
    },
    {
      key: 'userEmail',
      label: 'User',
      headerClassName: 'text-left',
      cellClassName: 'max-w-[150px] truncate',
      render: (row) => (
        <span className="text-xs text-text-secondary" title={row.userEmail || 'Anonymous'}>
          {row.userEmail || 'Anonymous'}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      label: 'IP',
      headerClassName: 'text-left',
      render: (row) => (
        <span className="font-mono text-xs text-text-tertiary">{row.ipAddress || '-'}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={logs}
      getRowKey={(row) => row._id}
      onRowClick={onLogClick}
      gridTemplateClass="grid-cols-[140px_70px_1fr_70px_70px_150px_120px]"
      className={cn('bg-background-secondary rounded-lg', className)}
      headerClassName="bg-background-tertiary"
      rowClassName={cn(
        'cursor-pointer',
        'hover:bg-background-tertiary/50'
      )}
    />
  );
};

export default LogsTable;
