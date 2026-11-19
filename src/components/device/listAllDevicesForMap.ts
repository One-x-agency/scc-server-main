import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';
import MemoryStorage from '@/service/store/inMemoryStorage.js';

export const ValidationSchema = {
  query: Joi.object({
    search: Joi.string().trim().max(255).allow('', null),
    user_id: Schema.uuid().allow(null),
  }),
};

type QueryParams = {
  search?: string | null;
  user_id?: string | null;
}

export async function listDevices(db: DatabaseClient, query: QueryParams = {}) {
  const { search, user_id } = query;

  let whereClause = ' WHERE 1=1 ';
  if (search) {
    whereClause += `
      AND (
        LOWER(d.name) ILIKE LOWER($search) OR
        LOWER(d.imei) ILIKE LOWER($search) OR
        LOWER(d.serial) ILIKE LOWER($search)
      )
    `;
  }

  const devices = await db.namedQueryAll(`
    SELECT
      d.*
    FROM devices d
    ${whereClause}
    ORDER BY d.created_at DESC
  `, {
    search: search ? `%${search}%` : null,
    user_id,
  });

  return devices;
}

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const { search, user_id } = req.validatedQuery as { search: string | null, user_id: string | null };

  const devices = await listDevices(db, {
    search,
    user_id: req.user.is_root_user ? user_id : req.user.id,
  });

  const devicesWithCache = devices.map((device) => {
    const deviceCache = MemoryStorage.devices[device.imei];
    if (deviceCache) return { ...device, last_record: deviceCache.last_record, system_status: deviceCache.system_status };
    return { ...device, system_status: 'healthy' };
  });

  res.status(200).json(devicesWithCache);
}
