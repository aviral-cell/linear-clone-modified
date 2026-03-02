import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useTeamDetail = (identifier) => {
  const { token } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    if (!identifier || !token) return;
    try {
      setLoading(true);
      const data = await api.teams.getByIdentifier(identifier);
      setTeam(data.team);
    } catch (err) {
      if (err.status !== 401) {
        toast.error('Failed to load team');
      }
    } finally {
      setLoading(false);
    }
  }, [identifier, token]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return { team, loading };
};
