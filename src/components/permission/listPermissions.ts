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

export async function listPermissions(db: DatabaseClient, query: { search: string | null, offset: number, limit: number }) {
  const { search, offset, limit } = query;

  let whereClause = '';
  if (search) {
    whereClause = `
      WHERE (
        LOWER(name) ILIKE LOWER($search) OR
        LOWER(description) ILIKE LOWER($search)
      )
    `;
  }

  const permissions = await db.namedQueryAll(`
    SELECT *
    FROM permissions
    ${whereClause}
    ORDER BY name ASC
    OFFSET $offset
    LIMIT $limit
  `, {
    search,
    offset,
    limit,
  });

  return permissions;
}
export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const { search, offset, limit } = req.validatedQuery as { search: string | null, offset: number, limit: number };
  const permissions = await listPermissions(db, { search, offset, limit });

  res.status(200).json(permissions);
}
