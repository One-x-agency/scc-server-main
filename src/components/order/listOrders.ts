import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  query: Joi.object({
    offset: Schema.pagination.offset(),
    limit: Schema.pagination.limit(),
    dealer_id: Schema.uuid(),
    search: Joi.string().trim().max(255).allow('', null),
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled').allow('', null),
    is_paid: Joi.boolean().default(true),
  }),

};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { offset, limit, dealer_id, search, status, is_paid } = req.validatedQuery || {};
  let whereClause = ' WHERE 1=1 ';

  if (dealer_id) whereClause += ' AND dealer_id = $dealer_id ';
  if (status) whereClause += ' AND o.status = $status ';
  if (is_paid !== undefined) whereClause += ' AND o.is_paid = $is_paid ';
  if (search) {
    whereClause += `
      AND (
        LOWER(c.id::text) ILIKE LOWER($search) OR
        LOWER(c.name::text) ILIKE LOWER($search) OR
        LOWER(c.phone_number::text) ILIKE LOWER($search) OR
        LOWER(d.name::text) ILIKE LOWER($search) OR
        LOWER(d.phone_number::text) ILIKE LOWER($search) OR
        LOWER(o.serial::text) ILIKE LOWER($search)
      )
        `;
  }

  const orders = await db.namedQueryAll(
    `
      SELECT
        o.*,
        (o.sub_total / 100)::numeric as sub_total,
        (o.total / 100)::numeric as total,
        c.name as customer_name,
        c.phone_number as customer_phone_number,
        d.name as dealer_name,
        d.phone_number as dealer_phone_number
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN dealers d ON o.dealer_id = d.id
      ${whereClause}
      ORDER BY created_at DESC
      OFFSET $offset
      LIMIT $limit
    `,
    {
      offset,
      limit,
      dealer_id,
      status,
      search: search ? `%${search}%` : null,
      is_paid,
    },
  );
  res.status(200).json(orders);
};
