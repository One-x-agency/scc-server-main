import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';
import MemoryStorage from '@/service/store/inMemoryStorage.js';

export const ValidationSchema = {
  query: Joi.object({
    search: Joi.string().trim().max(255).allow('', null),
    offset: Schema.pagination.offset(),
    limit: Schema.pagination.limit(),
    user_id: Schema.uuid().allow(null),
    not_attached_to_user_id: Schema.uuid().allow(null),
  }).custom((value) => {
    if (value.not_attached_to_user_id && value.user_id) {
      throw new Error('not_attached_to_user_id and user_id cannot be used together');
    }
    return value;
  }),
};

type QueryParams = {
  search?: string | null;
  offset?: number | null;
  limit?: number | null;
  user_id?: string | null;
  not_attached_to_user_id?: string | null;
}

export async function listDevices(db: DatabaseClient, query: QueryParams = {}) {
  const { search, offset, limit, user_id, not_attached_to_user_id } = query;

  let whereClause = ' WHERE 1=1 ';
  if (search) {
    whereClause += `
      AND (
        LOWER(d.name) ILIKE LOWER($search) OR
        LOWER(d.imei) ILIKE LOWER($search) OR
        LOWER(w.name) ILIKE LOWER($search) OR
        LOWER(d.serial) ILIKE LOWER($search)
      )
    `;
  }

  if (user_id) {
    whereClause += `
      AND d.id IN (SELECT device_id FROM user_device_mapping WHERE user_id = $user_id)
    `;
  }

  if (not_attached_to_user_id) {
    whereClause += `
      AND d.id NOT IN (SELECT device_id FROM user_device_mapping WHERE user_id = $not_attached_to_user_id)
    `;
  }

  const devices = await db.namedQueryAll(`
    SELECT
      d.*,
      w.name as ward_name,
      c.name as customer_name
    FROM devices d
    LEFT JOIN wards w ON w.id = d.ward_id
    LEFT JOIN customers c ON c.id = d.customer_id
    ${whereClause}
    ORDER BY d.created_at DESC
    OFFSET $offset
    LIMIT $limit
  `, {
    search: search ? `%${search}%` : null,
    offset,
    limit,
    user_id,
    not_attached_to_user_id,
  });

  return devices;
}

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const { search, offset, limit, user_id, not_attached_to_user_id } = req.validatedQuery as { search: string | null, offset: number, limit: number, user_id: string | null, not_attached_to_user_id: string | null };

  const devices = await listDevices(db, {
    search,
    offset,
    limit,
    user_id: req.user.is_root_user ? user_id : req.user.id,
    not_attached_to_user_id: req.user.is_root_user ? not_attached_to_user_id : null,
  });

  const devicesWithCache = devices.map((device) => {
    const deviceCache = MemoryStorage.devices[device.imei];
    if (deviceCache) return { ...device, last_record: deviceCache.last_record };
    return device;
  });

  res.status(200).json(devicesWithCache);
}
