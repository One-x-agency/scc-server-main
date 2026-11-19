/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  query: Joi.object({
    state_id: Schema.uuid(),
    search: Joi.string().trim().max(255).allow('', null),
    offset: Schema.pagination.offset(),
    limit: Schema.pagination.limit(),
  }),
};

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const { state_id, search, offset, limit } = req.validatedQuery as { state_id: string | null, search: string | null, offset: number, limit: number };

  let whereClause = ' WHERE 1=1 ';
  if (state_id) whereClause += ' AND f.state_id = $state_id ';
  if (search) whereClause += ' AND (LOWER(f.name) ILIKE LOWER($search) OR LOWER(s.name) ILIKE LOWER($search)) ';

  const fireStations = await db.namedQueryAll(`
    SELECT
      f.*,
      json_build_object(
        'id', s.id,
        'name', s.name
      ) as state
    FROM fire_stations f
    LEFT JOIN states s ON s.id = f.state_id
    ${whereClause}
    ORDER BY f.name ASC
    OFFSET $offset
    LIMIT $limit
  `, {
    state_id,
    search: search ? `%${search}%` : null,
    offset,
    limit,
  });

  res.status(200).json(fireStations);
}
