import ApiLog from '../../models/ApiLog.js';

export const getLogStats = async (startDate, endDate) => {
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

  return {
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
  };
};
