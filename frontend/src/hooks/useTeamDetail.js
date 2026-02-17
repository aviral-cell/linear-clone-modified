import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const useTeamDetail = (identifier) => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    if (!identifier) return;
    try {
      setLoading(true);
      const data = await api.teams.getByIdentifier(identifier);
      setTeam(data.team);
    } catch (err) {
      toast.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  }, [identifier]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return { team, loading };
};
