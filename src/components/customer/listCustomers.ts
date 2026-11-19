import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  query: Joi.object({
    offset: Schema.pagination.offset(),
    limit: Schema.pagination.limit(),
    search: Joi.string().trim().allow('', null),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { offset, limit, search } = req.validatedQuery;

  let whereClause = ' WHERE 1=1 ';

  if (search) {
    whereClause += `
      AND (
        LOWER(name) ILIKE LOWER($search) OR
        LOWER(email) ILIKE LOWER($search) OR
        LOWER(phone_number) ILIKE LOWER($search)
      ) `;
  }

  const customers = await db.namedQueryAll(`
    SELECT
      id,
      name,
      email,
      phone_number,
      is_email_verified,
      is_phone_number_verified,
      created_at,
      updated_at
    FROM customers
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $limit
    OFFSET $offset
  `, { search: search ? `%${search}%` : null, limit, offset });

  res.status(200).json(customers);
};
