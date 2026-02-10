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
      toast.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchTeams();
    }
  }, [token, fetchTeams]);

  const createTeam = async (data) => {
    const result = await api.teams.create(data);
    setTeams((prev) => [result.team, ...prev]);
    return result.team;
  };

  const updateTeam = async (identifier, data) => {
    const result = await api.teams.update(identifier, data);
    setTeams((prev) => prev.map((t) => (t._id === result.team._id ? result.team : t)));
    return result.team;
  };

  const deleteTeam = async (identifier) => {
    await api.teams.remove(identifier);
    setTeams((prev) => prev.filter((t) => t._id !== identifier && t.key !== identifier));
  };

  const addMembers = async (identifier, userIds) => {
    const result = await api.teams.addMembers(identifier, userIds);
    setTeams((prev) => prev.map((t) => (t._id === result.team._id ? result.team : t)));
    return result.team;
  };

  const removeMember = async (identifier, userId) => {
    const result = await api.teams.removeMember(identifier, userId);
    setTeams((prev) => prev.map((t) => (t._id === result.team._id ? result.team : t)));
    return result.team;
  };

  return (
    <TeamsContext.Provider
      value={{
        teams,
        loading,
        refetch: fetchTeams,
        createTeam,
        updateTeam,
        deleteTeam,
        addMembers,
        removeMember,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
};
