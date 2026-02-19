import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAdminLogs } from '../hooks/useAdminLogs';
import LogsTable from '../components/admin/LogsTable';
import LogFilters from '../components/admin/LogFilters';
import LogDetailsModal from '../components/admin/LogDetailsModal';
import { Button, LoadingScreen } from '../components/ui';
import Header from '../components/Header';
import { ShieldAlert, ChevronLeft, ChevronRight } from '../icons';

const AdminLogsPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [filterParams, setFilterParams] = useState({});

  const params = useMemo(
    () => ({
      page,
      limit: 50,
      ...filterParams,
    }),
    [page, filterParams]
  );

  const { logs, pagination, loading, error, refetch } = useAdminLogs(params);

  const handleLogClick = useCallback((log) => {
    setSelectedLogId(log._id);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedLogId(null);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleApplyFilters = useCallback((filters) => {
    setFilterParams(filters);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilterParams({});
    setPage(1);
  }, []);

  if (user?.role !== 'admin') {
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-background">
        <Header fallbackText="API Logs" />
      </div>

      <div className="flex items-center justify-between px-4 md:px-6 py-2 border-b border-border bg-background">
        <LogFilters onApplyFilters={handleApplyFilters} onClearFilters={handleClearFilters} />
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading && logs.length === 0 ? (
          <LoadingScreen />
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">Error loading logs: {error}</p>
            <Button onClick={() => refetch(params)}>Retry</Button>
          </div>
        ) : (
          <>
            <div className="bg-background-secondary rounded-lg border border-border overflow-hidden">
              <LogsTable logs={logs} onLogClick={handleLogClick} />
            </div>

            {logs.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <p className="text-text-tertiary">No logs found</p>
              </div>
            )}
          </>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-2 bg-background border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={!pagination.hasPrevPage || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm text-text-primary">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={!pagination.hasNextPage || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-text-tertiary">
            Showing {logs.length} of {pagination.totalLogs}
          </div>
        </div>
      )}

      {selectedLogId && <LogDetailsModal logId={selectedLogId} onClose={handleCloseModal} />}
    </div>
  );
};

export default AdminLogsPage;
