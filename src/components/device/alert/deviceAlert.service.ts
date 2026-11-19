/* eslint-disable import/prefer-default-export */
import Logger from '@/service/logger/index.js';
import Database from '@/service/database/index.js';

export async function CreateDeviceAlert({ device_id, type, message }: { device_id: string, type: string, message: string }) {
  const db = await Database.getConnection();
  try {
    const alert = await db.queryOne(
      `
        INSERT INTO device_alerts (device_id, alert_type, alert_message)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [device_id, type, message],
    );
    return alert;
  } catch (error) {
    Logger.error(`Error creating device alert: ${error}`);
  } finally {
    db.release();
  }
}
