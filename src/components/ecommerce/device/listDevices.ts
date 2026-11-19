/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import MemoryStorage from '@/service/store/inMemoryStorage.js';

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {

  const devices = await db.namedQueryAll(`
    SELECT
      d.*,
      w.name as ward_name
    FROM devices d
    LEFT JOIN wards w ON w.id = d.ward_id
    WHERE d.customer_id = $customer_id
    ORDER BY d.created_at DESC
  `, { customer_id: req.customer.id });

  const devicesWithCache = devices.map((device) => {
    const deviceCache = MemoryStorage.devices[device.imei];
    if (deviceCache) return { ...device, last_record: deviceCache.last_record, system_status: deviceCache.system_status };
    return { ...device, system_status: 'inactive' };
  });

  res.status(200).json(devicesWithCache);
}
