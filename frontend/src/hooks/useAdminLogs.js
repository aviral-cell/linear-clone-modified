import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/adminApi';

/**
 * Custom hook for fetching and managing admin logs
 */
export const useAdminLogs = (initialParams = {}) => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        setError(null);

        const mergedParams = { ...initialParams, ...params };
        const response = await adminApi.getLogs(mergedParams);

        setLogs(response.logs || []);
        setPagination(response.pagination || null);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
        setError(err.message || 'Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    },
    [initialParams]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, pagination, loading, error, refetch: fetchLogs };
};

export default useAdminLogs;
