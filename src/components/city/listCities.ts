/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  query: Joi.object({
    district_id: Schema.uuid(),
    search: Joi.string().trim().max(255).allow('', null),
    offset: Schema.pagination.offset(),
    limit: Schema.pagination.limit(),
  }),
};

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const { district_id, search, offset, limit } = req.validatedQuery as { district_id: string | null, search: string | null, offset: number, limit: number };

  let whereClause = ' WHERE 1=1 ';
  if (district_id) whereClause += ' AND c.district_id = $district_id ';
  if (search) whereClause += ' AND (LOWER(c.name) ILIKE LOWER($search) OR LOWER(d.name) ILIKE LOWER($search)) ';

  const cities = await db.namedQueryAll(`
    SELECT
      c.*,
      json_build_object(
        'id', d.id,
        'name', d.name
      ) as district
    FROM cities c
    LEFT JOIN districts d ON d.id = c.district_id
    ${whereClause}
    ORDER BY c.name ASC
    OFFSET $offset
    LIMIT $limit
  `, {
    district_id,
    search: search ? `%${search}%` : null,
    offset,
    limit,
  });

  res.status(200).json(cities);
}
