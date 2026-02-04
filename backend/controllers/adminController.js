import ApiLog from '../models/ApiLog.js';

/**
 * GET /api/admin/logs
 * Get paginated, filtered, searchable logs
 */
export const getAdminLogs = async (req, res) => {
  try {
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

    // Build filter
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

    // Status code filtering (supports "4xx", "5xx", or specific code)
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

    // Date range filtering
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Search in multiple fields
    if (search) {
      filter.$or = [
        { path: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortDirection };

    // Execute query with selected fields for list view
    const [logs, totalLogs] = await Promise.all([
      ApiLog.find(filter)
        .select('timestamp method path statusCode responseTime userEmail userId ipAddress isSlow isError')
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
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
};

/**
 * GET /api/admin/logs/stats
 * Get analytics and statistics about API logs
 */
export const getAdminLogStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
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

    // Get general stats
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

    // Get status code distribution
    const statusDistribution = await ApiLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $and: [{ $gte: ['$statusCode', 200] }, { $lt: ['$statusCode', 300] }] }, then: '2xx' },
                { case: { $and: [{ $gte: ['$statusCode', 300] }, { $lt: ['$statusCode', 400] }] }, then: '3xx' },
                { case: { $and: [{ $gte: ['$statusCode', 400] }, { $lt: ['$statusCode', 500] }] }, then: '4xx' },
                { case: { $gte: ['$statusCode', 500] }, then: '5xx' },
              ],
              default: 'other',
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get top endpoints
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

    // Get top users
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

    // Get requests over time (last 30 days by default)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const timeFilter = startDate ? dateFilter : { timestamp: { $gte: thirtyDaysAgo } };

    const requestsOverTime = await ApiLog.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          count: 1,
          avgResponseTime: { $round: ['$avgResponseTime', 0] },
          _id: 0,
        },
      },
    ]);

    // Format response
    const stats = generalStats[0] || { totalRequests: 0, avgResponseTime: 0, errorCount: 0, slowCount: 0 };
    const statusCodeDistribution = {};
    statusDistribution.forEach((item) => {
      statusCodeDistribution[item._id] = item.count;
    });

    res.json({
      stats: {
        totalRequests: stats.totalRequests,
        averageResponseTime: Math.round(stats.avgResponseTime || 0),
        errorRate: stats.totalRequests > 0 ? Number(((stats.errorCount / stats.totalRequests) * 100).toFixed(1)) : 0,
        slowRequestRate: stats.totalRequests > 0 ? Number(((stats.slowCount / stats.totalRequests) * 100).toFixed(1)) : 0,
        statusCodeDistribution,
        topEndpoints,
        topUsers,
        requestsOverTime,
      },
    });
  } catch (error) {
    console.error('Get admin log stats error:', error);
    res.status(500).json({ message: 'Failed to fetch log statistics' });
  }
};

/**
 * GET /api/admin/logs/:id
 * Get detailed information for a single log
 */
export const getAdminLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await ApiLog.findById(id).lean();

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    res.json({ log });
  } catch (error) {
    console.error('Get admin log by ID error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid log ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch log details' });
  }
};

/**
 * DELETE /api/admin/logs/cleanup
 * Manually trigger log cleanup (delete old logs)
 */
export const cleanupOldLogs = async (req, res) => {
  try {
    const { olderThanDays = 90 } = req.query;

    const days = parseInt(olderThanDays, 10);
    if (isNaN(days) || days < 1) {
      return res.status(400).json({ message: 'Invalid olderThanDays parameter' });
    }

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Delete old logs
    const result = await ApiLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    res.json({
      message: 'Log cleanup completed',
      deletedCount: result.deletedCount,
      olderThanDate: cutoffDate.toISOString(),
    });
  } catch (error) {
    console.error('Cleanup old logs error:', error);
    res.status(500).json({ message: 'Failed to cleanup logs' });
  }
};
