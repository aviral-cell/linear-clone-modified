import schedule from 'node-schedule';
import cleanupOldLogs from './utils/logCleanup.js';

let cleanupJob = null;

export const startScheduler = () => {
  cleanupJob = schedule.scheduleJob('0 2 * * *', async () => {
    console.log('[Scheduler] Running daily log cleanup...');
    try {
      const result = await cleanupOldLogs();
      console.log(
        `[Scheduler] Cleanup completed: ${result.deletedCount} logs deleted`
      );
    } catch (error) {
      console.error('[Scheduler] Cleanup failed:', error);
    }
  });

  console.log('[Scheduler] Scheduled jobs started');
  console.log('  - Log cleanup: Daily at 2:00 AM');
};

export const stopScheduler = () => {
  if (cleanupJob) {
    cleanupJob.cancel();
    console.log('[Scheduler] Scheduled jobs stopped');
  }
};

export default { startScheduler, stopScheduler };
