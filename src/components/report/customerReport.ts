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
        c.id,
        c.name,
        c.email,
        c.phone_number,
        c.gst_number,
        c.organization_name,
        c.pan_number,
        c.created_at,
        c.updated_at
      FROM customers c
      WHERE ($search::text IS NULL
             OR c.name ILIKE '%' || $search || '%'
             OR c.email ILIKE '%' || $search || '%'
             OR c.phone_number ILIKE '%' || $search || '%')
      ORDER BY c.created_at DESC
    `,
    { search: search || null },
  );

  sendCsv(res, 'customers.csv', rows);
};
