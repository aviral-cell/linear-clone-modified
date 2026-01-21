import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { baseURL } from '../utils';
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

  useEffect(() => {
    if (token) {
      fetchTeams();
    }
  }, [token]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/api/teams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams);
      } else {
        toast.error('Failed to fetch teams');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeamsContext.Provider value={{ teams, loading, refetch: fetchTeams }}>
      {children}
    </TeamsContext.Provider>
  );
};

