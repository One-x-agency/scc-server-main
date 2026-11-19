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
        u.id,
        u.name,
        u.email,
        u.phone_number,
        u.is_root_user,
        u.created_at,
        u.updated_at
      FROM users u
      WHERE ($search::text IS NULL
             OR u.name ILIKE '%' || $search || '%'
             OR u.email ILIKE '%' || $search || '%'
             OR u.phone_number ILIKE '%' || $search || '%')
      ORDER BY u.created_at DESC
    `,
    { search: search || null },
  );

  sendCsv(res, 'users.csv', rows);
};


