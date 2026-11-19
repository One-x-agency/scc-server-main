/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  query: Joi.object({
    fire_station_id: Schema.uuid(),
    search: Joi.string().trim().max(255).allow('', null),
    offset: Schema.pagination.offset(),
    limit: Schema.pagination.limit(),
  }),
};

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const { fire_station_id, search, offset, limit } = req.validatedQuery as { fire_station_id: string | null, search: string | null, offset: number, limit: number };

  let whereClause = ' WHERE 1=1 ';
  if (fire_station_id) whereClause += ' AND z.fire_station_id = $fire_station_id ';
  if (search) whereClause += ' AND (LOWER(z.name) ILIKE LOWER($search) OR LOWER(fs.name) ILIKE LOWER($search)) ';

  const zones = await db.namedQueryAll(`
    SELECT
      z.*,
      json_build_object(
        'id', fs.id,
        'name', fs.name
      ) as fire_station,
      json_build_object(
        'id', st.id,
        'name', st.name
      ) as state
    FROM zones z
    LEFT JOIN fire_stations fs ON fs.id = z.fire_station_id
    LEFT JOIN states st ON st.id = fs.state_id
    ${whereClause}
    ORDER BY z.name ASC
    OFFSET $offset
    LIMIT $limit
  `, {
    fire_station_id,
    search: search ? `%${search}%` : null,
    offset,
    limit,
  });

  res.status(200).json(zones);
}
