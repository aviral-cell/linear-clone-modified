import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAdminLogs } from '../hooks/useAdminLogs';
import LogsTable from '../components/admin/LogsTable';
import { Button, LoadingScreen } from '../components/ui';
import Header from '../components/Header';
import { ShieldAlert, ChevronLeft, ChevronRight } from '../icons';

/**
 * AdminLogsPage - Main admin logs viewing page
 */
const AdminLogsPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [selectedLogId, setSelectedLogId] = useState(null);

  // Build params with current page
  const params = useMemo(
    () => ({
      page,
      limit: 50,
    }),
    [page]
  );

  const { logs, pagination, loading, error, refetch } = useAdminLogs(params);

  // Handle log click - will be used for modal in 103F
  const handleLogClick = useCallback((log) => {
    setSelectedLogId(log._id);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  // Access denied view for non-admin users
  if (!user?.isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h2>
          <p className="text-text-secondary">
            You don't have permission to access this page. Admin privileges are required.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && logs.length === 0) {
    return <LoadingScreen />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex flex-col p-6">
        <Header fallbackText="API Logs" />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md text-center">
            <p className="text-red-400 mb-4">Error loading logs: {error}</p>
            <Button onClick={() => refetch(params)}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-background">
        <Header fallbackText="API Logs" />
      </div>

      {/* Stats Summary */}
      <div className="px-6 py-4 bg-background border-b border-border">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Total Logs"
            value={pagination?.totalLogs?.toLocaleString() || '0'}
          />
          <StatCard label="Current Page" value={pagination?.page || 1} />
          <StatCard label="Per Page" value={pagination?.limit || 50} />
          <StatCard label="Total Pages" value={pagination?.totalPages || 1} />
        </div>
      </div>

      {/* Logs Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-background-secondary rounded-lg border border-border overflow-hidden">
          <LogsTable logs={logs} onLogClick={handleLogClick} />
        </div>

        {/* Empty State */}
        {logs.length === 0 && !loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-text-tertiary">No logs found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 bg-background border-t border-border flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Showing {logs.length} of {pagination.totalLogs} logs
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={!pagination.hasPrevPage || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-text-primary">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={!pagination.hasNextPage || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Log Details Modal will be added in 103F */}
      {selectedLogId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-secondary rounded-lg p-6 max-w-lg">
            <p className="text-text-primary mb-4">Log ID: {selectedLogId}</p>
            <p className="text-text-secondary text-sm mb-4">
              Full log details modal will be implemented in WORKFLOW-103F
            </p>
            <Button onClick={() => setSelectedLogId(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * StatCard component for displaying summary statistics
 */
const StatCard = ({ label, value }) => (
  <div className="bg-background-secondary rounded-lg p-4 border border-border">
    <div className="text-xs text-text-tertiary uppercase tracking-wide mb-1">{label}</div>
    <div className="text-xl font-bold text-text-primary">{value}</div>
  </div>
);

export default AdminLogsPage;
