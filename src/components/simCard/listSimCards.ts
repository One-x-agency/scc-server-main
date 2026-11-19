import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  query: Joi.object({
    search: Joi.string().trim().max(255).allow('', null),
    offset: Schema.pagination.offset(),
    limit: Schema.pagination.limit(),
    is_attached: Joi.boolean(),
  }),
};

type QueryParams = {
  search?: string | null;
  offset?: number | null;
  limit?: number | null;
  is_attached?: boolean | null;
}

export async function listSimCards(db: DatabaseClient, query: QueryParams = {}) {
  const { search, offset, limit, is_attached } = query;

  let whereClause = ' WHERE 1=1 ';
  if (search) {
    whereClause = `
      WHERE (
        LOWER(sc.number) ILIKE LOWER($search) OR
        LOWER(sc.phone_number) ILIKE LOWER($search) OR
        LOWER(sc.imsi_number) ILIKE LOWER($search)
      )
    `;
  }
  if (is_attached !== undefined) {
    whereClause += `
      AND ((d.id IS NOT NULL) = $is_attached)
    `;
  }

  const simCards = await db.namedQueryAll(`
    SELECT
      sc.*,
      sp.name as sim_plan_name,
      sp.sms_limit,
      sp.data_limit,
      sp.call_limit,
      sp.subscription_amount,
      (d.id IS NOT NULL) as is_attached,
      jsonb_build_object(
        'id', d.id,
        'imei', d.imei,
        'name', d.name
      ) as device
    FROM sim_cards sc
    LEFT JOIN devices d ON d.sim_card_id = sc.id
    LEFT JOIN sim_plans sp ON sp.id = sc.sim_plan_id
    ${whereClause}
    ORDER BY sc.created_at DESC
    OFFSET $offset
    LIMIT $limit
  `, {
    search: search ? `%${search}%` : '',
    offset,
    limit,
    is_attached,
  });

  return simCards;
}

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const { search, offset, limit, is_attached } = req.validatedQuery as { search: string | null, offset: number, limit: number, is_attached: boolean | null };

  const simCards = await listSimCards(db, { search, offset, limit, is_attached });

  res.status(200).json(simCards);
}
