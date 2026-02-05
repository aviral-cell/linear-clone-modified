import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/adminApi';

export const useLogStats = (dateRange = {}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getLogStats(dateRange);
      setStats(response.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export default useLogStats;
