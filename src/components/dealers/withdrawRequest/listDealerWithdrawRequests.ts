import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  query: Joi.object({
    offset: Schema.pagination.offset(),
    limit: Schema.pagination.limit(),
    search: Joi.string().trim().max(255).allow('', null),
    status: Schema.dealer.withdrawRequest.status().allow(null),
    dealer_id: Schema.uuid().allow(null),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { offset, limit, search, status, dealer_id } = req.validatedQuery || {};

  let whereClause = ' WHERE 1=1 ';

  if (dealer_id) whereClause += ' AND dwr.dealer_id = $dealer_id ';
  if (status) whereClause += ' AND dwr.status = $status ';

  if (search) {
    whereClause += `
    AND (
      LOWER(d.name) ILIKE LOWER($search)
    )
  `;
  }

  const withdrawRequests = await db.namedQueryAll(
    `
    SELECT
      dwr.*,
      (dwr.amount / 100)::numeric as amount,
      json_build_object(
        'id', d.id,
        'name', d.name,
        'email', d.email,
        'phone_number', d.phone_number
      ) as dealer
    FROM dealer_withdraw_requests dwr
    LEFT JOIN dealers d ON dwr.dealer_id = d.id
    ${whereClause}
    ORDER BY created_at DESC
    OFFSET $offset
    LIMIT $limit
  `,
    {
      offset,
      limit,
      search: search ? `%${search}%` : null,
      status,
      dealer_id,
    },
  );

  res.status(200).json(withdrawRequests);
};
