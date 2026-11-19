import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  query: Joi.object({
    search: Joi.string().trim().max(255).allow('', null),
    offset: Schema.pagination.offset(),
    limit: Schema.pagination.limit(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { search, offset, limit } = req.validatedQuery;

  let whereClause = ' WHERE 1=1 ';

  if (search) {
    whereClause += ` AND (
      LOWER(name) ILIKE LOWER($search) OR
      LOWER(email) ILIKE LOWER($search) OR
      LOWER(phone_number) ILIKE LOWER($search)
    ) `;
  }
  const dealers = await db.namedQueryAll(
    `
    SELECT
      *,
      (balance / 100)::numeric as balance
    FROM dealers
    ${whereClause}
    ORDER BY name ASC
    OFFSET $offset
    LIMIT $limit
  `,
    {
      search: search ? `%${search}%` : null,
      offset,
      limit,
    },
  );

  res.status(200).json(dealers);
};
