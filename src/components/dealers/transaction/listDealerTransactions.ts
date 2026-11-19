import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  query: Joi.object({
    dealer_id: Schema.uuid(),
    offset: Schema.pagination.offset(),
    limit: Schema.pagination.limit(),
    search: Joi.string().trim().max(255).allow('', null),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { dealer_id, search, offset, limit } = req.validatedQuery;

  let whereClause = ' WHERE 1=1 ';
  if (dealer_id) whereClause += ' AND d.dealer_id = $dealer_id ';
  if (search) {
    whereClause += `
      AND (
        LOWER(d.name) ILIKE LOWER($search) OR
        LOWER(dt.remark) ILIKE LOWER($search)
      )
    `;
  }

  const dealerTransactions = await db.namedQueryAll(
    `
    SELECT
      dt.*,
      (dt.amount / 100)::numeric as amount,
      json_build_object(
        'id', d.id,
        'name', d.name,
        'email', d.email,
        'phone_number', d.phone_number
      ) as dealer
    FROM dealer_transactions dt
    LEFT JOIN dealers d ON dt.dealer_id = d.id
    ${whereClause}
    ORDER BY
      created_at DESC
    LIMIT $limit
    OFFSET $offset
  `,
    {
      dealer_id,
      search: search ? `%${search}%` : null,
      offset,
      limit,
    },
  );

  res.status(200).json(dealerTransactions);

};
