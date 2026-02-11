import ApiLog from '../models/ApiLog.js';
import { BadRequestError, NotFoundError } from '../utils/appError.js';

export const getAdminLogs = async (req, res) => {
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
  } = req.query;

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

  res.json({
    logs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalLogs,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  });
};

export const getAdminLogById = async (req, res) => {
  const { id } = req.params;

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new BadRequestError('Invalid log ID format');
  }

  const log = await ApiLog.findById(id).lean();

  if (!log) {
    throw new NotFoundError('Log not found');
  }

  res.json({ log });
};

export const getAdminLogStats = async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.timestamp = {};
    if (startDate) {
      dateFilter.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.timestamp.$lte = new Date(endDate);
    }
  }

  const generalStats = await ApiLog.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        avgResponseTime: { $avg: '$responseTime' },
        errorCount: { $sum: { $cond: ['$isError', 1, 0] } },
        slowCount: { $sum: { $cond: ['$isSlow', 1, 0] } },
      },
    },
  ]);

  const statusDistribution = await ApiLog.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              {
                case: { $and: [{ $gte: ['$statusCode', 200] }, { $lt: ['$statusCode', 300] }] },
                then: '2xx',
              },
              {
                case: { $and: [{ $gte: ['$statusCode', 300] }, { $lt: ['$statusCode', 400] }] },
                then: '3xx',
              },
              {
                case: { $and: [{ $gte: ['$statusCode', 400] }, { $lt: ['$statusCode', 500] }] },
                then: '4xx',
              },
              { case: { $gte: ['$statusCode', 500] }, then: '5xx' },
            ],
            default: 'other',
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const topEndpoints = await ApiLog.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$path',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$responseTime' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        path: '$_id',
        count: 1,
        avgResponseTime: { $round: ['$avgResponseTime', 0] },
        _id: 0,
      },
    },
  ]);

  const topUsers = await ApiLog.aggregate([
    { $match: { ...dateFilter, userId: { $ne: null } } },
    {
      $group: {
        _id: '$userId',
        userEmail: { $first: '$userEmail' },
        requestCount: { $sum: 1 },
      },
    },
    { $sort: { requestCount: -1 } },
    { $limit: 10 },
    {
      $project: {
        userId: '$_id',
        userEmail: 1,
        requestCount: 1,
        _id: 0,
      },
    },
  ]);

  const stats = generalStats[0] || {
    totalRequests: 0,
    avgResponseTime: 0,
    errorCount: 0,
    slowCount: 0,
  };
  const statusCodeDistribution = {};
  statusDistribution.forEach((item) => {
    statusCodeDistribution[item._id] = item.count;
  });

  res.json({
    stats: {
      totalRequests: stats.totalRequests,
      averageResponseTime: Math.round(stats.avgResponseTime || 0),
      errorRate:
        stats.totalRequests > 0
          ? Number(((stats.errorCount / stats.totalRequests) * 100).toFixed(1))
          : 0,
      slowRequestRate:
        stats.totalRequests > 0
          ? Number(((stats.slowCount / stats.totalRequests) * 100).toFixed(1))
          : 0,
      statusCodeDistribution,
      topEndpoints,
      topUsers,
    },
  });
};
