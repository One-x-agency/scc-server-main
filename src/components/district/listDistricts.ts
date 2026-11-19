/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  query: Joi.object({
    search: Joi.string().trim().max(255).allow('', null),
    offset: Schema.pagination.offset(),
    limit: Schema.pagination.limit(),
  }),
};

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const { search, offset, limit } = req.validatedQuery as { search: string | null, offset: number, limit: number };

  let whereClause = ' WHERE 1=1 ';
  if (search) whereClause += ' AND LOWER(name) ILIKE LOWER($search) ';

  const districts = await db.namedQueryAll(`
    SELECT
      *
    FROM districts
    ${whereClause}
    ORDER BY name ASC
    OFFSET $offset
    LIMIT $limit
  `, {
    search: search ? `%${search}%` : null,
    offset,
    limit,
  });

  res.status(200).json(districts);
}
