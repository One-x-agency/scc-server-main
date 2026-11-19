/* eslint-disable import/prefer-default-export */
import Logger from '@/service/logger/index.js';
import Database from '@/service/database/index.js';

export async function CreateDeviceLog({ device_id, imei, timestamp, record }: { device_id: string, imei: string, timestamp: string, record: object }) {
  const db = await Database.getConnection();
  try {
    const alert = await db.queryOne(
      `
        INSERT INTO device_logs (device_id, imei, timestamp, record)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [device_id, imei, timestamp, record],
    );
    return alert;
  } catch (error) {
    Logger.error(`Error creating device log: ${error}`);
  } finally {
    db.release();
  }
}
