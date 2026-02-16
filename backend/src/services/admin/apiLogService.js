import ApiLog from '../../models/ApiLog.js';
import { BadRequestError, NotFoundError } from '../../utils/appError.js';

export const getLogs = async (filters = {}) => {
  const {
    page = 1,
    limit = 50,
    method,
    statusCode,
    userId,
    startDate,
    endDate,
    search,
    isSlow,
    isError,
    sortBy = 'timestamp',
    sortOrder = 'desc',
  } = filters;

  const filter = {};

  if (method) {
    filter.method = method.toUpperCase();
  }

  if (userId) {
    filter.userId = userId;
  }

  if (isSlow === 'true') {
    filter.isSlow = true;
  }

  if (isError === 'true') {
    filter.isError = true;
  }

  if (statusCode) {
    if (statusCode === '2xx') {
      filter.statusCode = { $gte: 200, $lt: 300 };
    } else if (statusCode === '3xx') {
      filter.statusCode = { $gte: 300, $lt: 400 };
    } else if (statusCode === '4xx') {
      filter.statusCode = { $gte: 400, $lt: 500 };
    } else if (statusCode === '5xx') {
      filter.statusCode = { $gte: 500 };
    } else {
      filter.statusCode = parseInt(statusCode, 10);
    }
  }

  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) {
      filter.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.timestamp.$lte = new Date(endDate);
    }
  }

  if (search) {
    filter.$or = [
      { path: { $regex: search, $options: 'i' } },
      { userEmail: { $regex: search, $options: 'i' } },
      { ipAddress: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortDirection };

  const [logs, totalLogs] = await Promise.all([
    ApiLog.find(filter)
      .select(
        'timestamp method path statusCode responseTime userEmail userId ipAddress isSlow isError'
      )
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    ApiLog.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalLogs / limitNum);

  return {
    logs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalLogs,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
};

export const getLogById = async (logId) => {
  if (!/^[0-9a-fA-F]{24}$/.test(logId)) {
    throw new BadRequestError('Invalid log ID format');
  }

  const log = await ApiLog.findById(logId).lean();

  if (!log) {
    throw new NotFoundError('Log not found');
  }

  return log;
};

