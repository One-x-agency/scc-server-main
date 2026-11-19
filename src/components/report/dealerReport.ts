import { Request, Response, NextFunction } from 'express';
import { Joi } from '@/utils/validationHelper.js';
import { DatabaseClient } from '@/service/database/index.js';
import { sendCsv } from '@/components/report/utils.js';

export const ValidationSchema = {
  query: Joi.object({
    search: Joi.string().trim().allow(''),
  }),
};

export const Controller = async (req: Request & { validatedQuery?: any }, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { search } = req.validatedQuery || {};

  const rows = await db.namedQueryAll(
    `
      SELECT
        d.id,
        d.name,
        d.email,
        d.phone_number,
        d.pan_number,
        d.promo_code,
        d.balance,
        d.commission_percentage,
        d.created_at,
        d.updated_at
      FROM dealers d
      WHERE ($search::text IS NULL
             OR d.name ILIKE '%' || $search || '%'
             OR d.email ILIKE '%' || $search || '%'
             OR d.phone_number ILIKE '%' || $search || '%'
             OR d.pan_number ILIKE '%' || $search || '%')
      ORDER BY d.created_at DESC
    `,
    { search: search || null },
  );

  sendCsv(res, 'dealers.csv', rows);
};


