import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  query: Joi.object({
    offset: Schema.pagination.offset(),
    limit: Schema.pagination.limit(),
    search: Joi.string().trim().max(255).allow('', null),
    status: Joi.string().valid('pending', 'processing', 'cancelled', 'completed').allow('', null),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { offset, limit, search, status } = req.validatedQuery || {};
  let whereClause = ' WHERE 1=1 ';

  if (search) {
    whereClause += `
      AND (
        name ILIKE $search OR
        email ILIKE $search OR
        phone_number ILIKE $search
      )
      `;
  }
  if (status) whereClause += ' AND status = $status ';

  const inquiries = await db.namedQueryAll(
    `
    SELECT
      *
    FROM inquiries
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $limit
    OFFSET $offset
  `,
    {
      offset,
      limit,
      search: search ? `%${search}%` : null,
      status,
    },
  );

  res.status(200).json(inquiries);
};
