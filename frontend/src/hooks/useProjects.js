import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const useProjects = (teamId = null, options = {}) => {
  const { status = 'all', creatorId = 'all', autoFetch = true } = options;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async (opts = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const targetStatus = opts.status !== undefined ? opts.status : status;
      const targetTeamId = opts.teamId !== undefined ? opts.teamId : teamId;
      const targetCreatorId = opts.creatorId !== undefined ? opts.creatorId : creatorId;

      if (targetStatus && targetStatus !== 'all') {
        params.append('status', targetStatus);
      }
      if (targetTeamId) {
        params.append('teamId', targetTeamId);
      }
      if (targetCreatorId && targetCreatorId !== 'all') {
        params.append('creatorId', targetCreatorId);
      }

      const query = params.toString();
      const data = await api.get(`/api/projects${query ? `?${query}` : ''}`);
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [teamId, status, creatorId]);

  useEffect(() => {
    if (autoFetch) {
      fetchProjects();
    }
  }, [fetchProjects, autoFetch]);

  return { projects, loading, error, refetch: fetchProjects };
};
