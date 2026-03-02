import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const TeamsContext = createContext();

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (!context) {
    throw new Error('useTeams must be used within a TeamsProvider');
  }
  return context;
};

export const TeamsProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.teams.getAll();
      setTeams(data.teams);
    } catch (error) {
      if (error.status !== 401) {
        toast.error('Failed to fetch teams');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchTeams();
    }
  }, [token, fetchTeams]);

  return (
    <TeamsContext.Provider
      value={{
        teams,
        loading,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
};
