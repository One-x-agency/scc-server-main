/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  query: Joi.object({
    zone_id: Schema.uuid(),
    search: Joi.string().trim().max(255).allow('', null),
    offset: Schema.pagination.offset(),
    limit: Schema.pagination.limit(),
  }),
};

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const { zone_id, search, offset, limit } = req.validatedQuery as { zone_id: string | null, search: string | null, offset: number, limit: number };

  let whereClause = ' WHERE 1=1 ';
  if (zone_id) whereClause += ' AND w.zone_id = $zone_id ';
  if (search) whereClause += ' AND (LOWER(w.name) ILIKE LOWER($search) OR LOWER(z.name) ILIKE LOWER($search)) ';

  const wards = await db.namedQueryAll(`
    SELECT
      w.*,
      json_build_object(
        'id', z.id,
        'name', z.name
      ) as zone,
      json_build_object(
        'id', fs.id,
        'name', fs.name
      ) as fire_station,
      json_build_object(
        'id', st.id,
        'name', st.name
      ) as state
    FROM wards w
    LEFT JOIN zones z ON z.id = w.zone_id
    LEFT JOIN fire_stations fs ON fs.id = z.fire_station_id
    LEFT JOIN states st ON st.id = fs.state_id
    ${whereClause}
    ORDER BY w.name ASC
    OFFSET $offset
    LIMIT $limit
  `, {
    zone_id,
    search: search ? `%${search}%` : null,
    offset,
    limit,
  });

  res.status(200).json(wards);
}
