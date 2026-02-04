import ApiLog from '../models/ApiLog.js';

const DEFAULT_RETENTION_DAYS = 90;

export const cleanupOldLogs = async (retentionDays = null) => {
  try {
    const days =
      retentionDays ||
      parseInt(process.env.LOG_RETENTION_DAYS, 10) ||
      DEFAULT_RETENTION_DAYS;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await ApiLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    console.log(
      `[Log Cleanup] Deleted ${result.deletedCount} logs older than ${cutoffDate.toISOString()}`
    );

    return {
      deletedCount: result.deletedCount,
      cutoffDate,
    };
  } catch (error) {
    console.error('[Log Cleanup] Error during cleanup:', error);
    throw error;
  }
};

export default cleanupOldLogs;
