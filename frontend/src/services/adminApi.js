import { api } from './api';

export const adminApi = {
  getLogs: (params = {}) => {
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      )
    ).toString();
    return api.get(`/api/admin/logs${queryString ? `?${queryString}` : ''}`);
  },

  getLogById: (logId) => {
    return api.get(`/api/admin/logs/${logId}`);
  },

  getLogStats: (params = {}) => {
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      )
    ).toString();
    return api.get(`/api/admin/logs/stats${queryString ? `?${queryString}` : ''}`);
  },

  cleanupLogs: (olderThanDays = 90) => {
    return api.delete(`/api/admin/logs/cleanup?olderThanDays=${olderThanDays}`);
  },
};

export default adminApi;
