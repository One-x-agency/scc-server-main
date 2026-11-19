import cron from 'node-cron';
import env from '@/config/env.js';

import { task as postgresBackupTask } from './scripts/postgresBackup.script.js';

const isProduction = env.env === 'prod';

console.log('⏱ Backup scheduler started...');

/**
# ┌────────────── second (optional)
# │ ┌──────────── minute
# │ │ ┌────────── hour
# │ │ │ ┌──────── day of month
# │ │ │ │ ┌────── month
# │ │ │ │ │ ┌──── day of week
# │ │ │ │ │ │
# │ │ │ │ │ │
# * * * * * *
*/

// Daily 2:00 AM
// eslint-disable-next-line import/prefer-default-export
export const PostgresBackupJob = isProduction
  ? cron.createTask('0 2 * * *', './scripts/postgresBackup.script.js', { timezone: 'Asia/Kolkata' })
  : cron.createTask('0 2 * * *', postgresBackupTask, { timezone: 'Asia/Kolkata' });
