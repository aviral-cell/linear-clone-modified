import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const useIssue = (identifier, options = {}) => {
  const { silent = false, onError } = options;
  const [issue, setIssue] = useState(null);
  const [subIssues, setSubIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIssue = useCallback(async (isSilent = false) => {
    if (!identifier) return;

    try {
      if (!isSilent) setLoading(true);
      setError(null);
      const data = await api.issues.getByIdentifier(identifier);
      setIssue(data.issue);
      setSubIssues(data.subIssues || []);
    } catch (err) {
      console.error('Error fetching issue:', err);
      setError(err);
      if (!isSilent && !silent) {
        toast.error('Issue not found');
      }
      if (onError) {
        onError(err);
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [identifier, silent, onError]);

  useEffect(() => {
    fetchIssue();
  }, [fetchIssue]);

  const refetch = (isSilent = true) => {
    return fetchIssue(isSilent);
  };

  return { issue, subIssues, loading, error, refetch };
};
