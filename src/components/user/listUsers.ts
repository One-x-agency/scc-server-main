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

type QueryParams = {
  search?: string | null;
  offset?: number | null;
  limit?: number | null;
}

export async function listUsers(db: DatabaseClient, query: QueryParams = {}) {
  const { search, offset, limit } = query;

  let whereClause = ' WHERE u.is_root_user = false ';
  if (search) {
    whereClause += `
      AND (
        LOWER(u.name) ILIKE LOWER($search) OR
        LOWER(u.email) ILIKE LOWER($search) OR
        LOWER(u.phone_number) ILIKE LOWER($search)
      )
    `;
  }

  const users = await db.namedQueryAll(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.phone_number,
      u.is_root_user,
      array_agg(
        json_build_object(
          'id', r.id,
          'name', r.name
        )
      ) as roles
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    ${whereClause}
    GROUP BY u.id
    ORDER BY u.name ASC
    OFFSET $offset
    LIMIT $limit
  `, {
    search,
    offset,
    limit,
  });

  return users;
}

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const { search, offset, limit } = req.validatedQuery as { search: string | null, offset: number, limit: number };

  const users = await listUsers(db, { search, offset, limit });

  res.status(200).json(users);
}
