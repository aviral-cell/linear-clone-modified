import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

const FILTER_KEYS = ['status', 'priority', 'assignee', 'creator'];

export const useIssueFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const result = {};
    FILTER_KEYS.forEach((key) => {
      const value = searchParams.get(key);
      result[key] = value ? value.split(',') : [];
    });
    return result;
  }, [searchParams]);

  const setFilter = useCallback(
    (key, values) => {
      const next = new URLSearchParams(searchParams);
      if (values && values.length > 0) {
        next.set(key, values.join(','));
      } else {
        next.delete(key);
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const toggleFilterValue = useCallback(
    (key, value) => {
      const current = filters[key] || [];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setFilter(key, newValues);
    },
    [filters, setFilter]
  );

  const clearFilter = useCallback(
    (key) => {
      const next = new URLSearchParams(searchParams);
      next.delete(key);
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const clearAllFilters = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    FILTER_KEYS.forEach((key) => next.delete(key));
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const hasActiveFilters = useMemo(() => {
    return FILTER_KEYS.some((key) => filters[key].length > 0);
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    return FILTER_KEYS.reduce((count, key) => count + filters[key].length, 0);
  }, [filters]);

  const getFilterQueryString = useCallback(() => {
    const params = new URLSearchParams();
    FILTER_KEYS.forEach((key) => {
      if (filters[key].length > 0) {
        params.set(key, filters[key].join(','));
      }
    });
    return params.toString();
  }, [filters]);

  return {
    filters,
    setFilter,
    toggleFilterValue,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
    getFilterQueryString,
  };
};
