import ApiLog from '../models/ApiLog.js';

const DEFAULT_RETENTION_DAYS = 90;

/**
 * Delete API logs older than specified days
 * @param {number} retentionDays - Keep logs newer than this many days
 * @returns {Promise<{deletedCount: number, cutoffDate: Date}>}
 */
export const cleanupOldLogs = async (retentionDays = null) => {
  try {
    // Get retention period from env or parameter
    const days =
      retentionDays ||
      parseInt(process.env.LOG_RETENTION_DAYS, 10) ||
      DEFAULT_RETENTION_DAYS;

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Delete old logs
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
