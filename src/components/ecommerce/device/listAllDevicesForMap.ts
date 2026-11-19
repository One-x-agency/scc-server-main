import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import MemoryStorage from '@/service/store/inMemoryStorage.js';

export async function listDevices(db: DatabaseClient, customer_id: string) {

  const devices = await db.namedQueryAll(`
    SELECT
      d.*
    FROM devices d
    WHERE d.customer_id = $customer_id
    ORDER BY d.created_at DESC
  `, {
    customer_id,
  });

  return devices;
}

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {

  const devices = await listDevices(db, req.customer.id);

  const devicesWithCache = devices.map((device) => {
    const deviceCache = MemoryStorage.devices[device.imei];
    if (deviceCache) return { ...device, last_record: deviceCache.last_record, system_status: deviceCache.system_status };
    return { ...device, system_status: 'healthy' };
  });

  res.status(200).json(devicesWithCache);
}
