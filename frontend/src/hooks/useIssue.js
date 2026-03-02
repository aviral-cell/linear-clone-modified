import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useIssue = (identifier, options = {}) => {
  const { token } = useAuth();
  const { silent = false, onError } = options;
  const [issue, setIssue] = useState(null);
  const [subIssues, setSubIssues] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIssue = useCallback(
    async (isSilent = false) => {
      if (!identifier || !token) return;

      try {
        if (!isSilent) setLoading(true);
        setError(null);
        const data = await api.issues.getByIdentifier(identifier);
        setIssue(data.issue);
        setSubIssues(data.subIssues || []);
        setIsSubscribed(data.isSubscribed || false);
      } catch (err) {
        console.error('Error fetching issue:', err);
        setError(err);
        if (!isSilent && !silent && err.status !== 401) {
          toast.error('Issue not found');
        }
        if (onError) {
          onError(err);
        }
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [identifier, silent, onError]
  );

  useEffect(() => {
    fetchIssue();
  }, [fetchIssue]);

  const refetch = (isSilent = true) => {
    return fetchIssue(isSilent);
  };

  return { issue, subIssues, isSubscribed, setIsSubscribed, loading, error, refetch };
};
