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

export async function listSimPlans(db: DatabaseClient, query: QueryParams = {}) {
  const { search, offset, limit } = query;

  let whereClause = '';
  if (search && search.length > 0) {
    whereClause = `
      WHERE (
        LOWER(name) ILIKE LOWER($search) OR
        sms_limit::text ILIKE LOWER($search) OR
        data_limit::text ILIKE LOWER($search) OR
        call_limit::text ILIKE LOWER($search) OR
        subscription_amount::text ILIKE LOWER($search) OR
        LOWER(remark) ILIKE LOWER($search)
      )
    `;
  }

  const simPlans = await db.namedQueryAll(`
    SELECT *
    FROM sim_plans
    ${whereClause}
    ORDER BY created_at DESC
    OFFSET $offset
    LIMIT $limit
  `, {
    search,
    offset,
    limit,
  });

  return simPlans;
}

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const { search, offset, limit } = req.validatedQuery as { search: string | null, offset: number, limit: number };

  const simPlans = await listSimPlans(db, { search: search?.toLowerCase() || null, offset, limit });

  res.status(200).json(simPlans);
}
