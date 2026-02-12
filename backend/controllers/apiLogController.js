import * as apiLogService from '../services/apiLogService.js';

export const getAdminLogs = async (req, res) => {
  const filters = req.query;
  const result = await apiLogService.getLogs(filters);
  res.json(result);
};

export const getAdminLogById = async (req, res) => {
  const logId = req.params.id;
  const log = await apiLogService.getLogById(logId);
  res.json({ log });
};

export const getAdminLogStats = async (req, res) => {
  const { startDate, endDate } = req.query;
  const stats = await apiLogService.getLogStats(startDate, endDate);
  res.json({ stats });
};
