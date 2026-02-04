import { api } from './api';

/**
 * Admin API Service
 * Handles all admin-related API calls
 */
export const adminApi = {
  /**
   * Get paginated logs with optional filters
   */
  getLogs: (params = {}) => {
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      )
    ).toString();
    return api.get(`/api/admin/logs${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get a single log by ID
   */
  getLogById: (logId) => {
    return api.get(`/api/admin/logs/${logId}`);
  },

  /**
   * Get log statistics and analytics
   */
  getLogStats: (params = {}) => {
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      )
    ).toString();
    return api.get(`/api/admin/logs/stats${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Trigger manual log cleanup
   */
  cleanupLogs: (olderThanDays = 90) => {
    return api.delete(`/api/admin/logs/cleanup?olderThanDays=${olderThanDays}`);
  },
};

export default adminApi;
