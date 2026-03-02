import { getSampleLogs, getSampleLogById } from '../../utils/sampleApiLogs.js';
import { BadRequestError, NotFoundError } from '../../utils/appError.js';

export const getLogs = async (filters = {}) => {
  return getSampleLogs(filters);
};

export const getLogById = async (logId) => {
  return getSampleLogById(logId);
};
