import { Request, Response, NextFunction } from 'express';
import { Joi } from '@/utils/validationHelper.js';
import { DatabaseClient } from '@/service/database/index.js';
import { sendCsv } from '@/components/report/utils.js';

export const ValidationSchema = {
  query: Joi.object({
    status: Joi.string().trim().valid('pending', 'resolved', 'closed').allow(null),
  }),
};

export const Controller = async (req: Request & { validatedQuery?: any }, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { status } = req.validatedQuery || {};

  const rows = await db.namedQueryAll(
    `
      SELECT
        i.id,
        i.name,
        i.email,
        i.phone_number,
        i.message,
        i.status,
        i.created_at,
        i.updated_at
      FROM inquiries i
      WHERE ($status::varchar IS NULL OR i.status = $status)
      ORDER BY i.created_at DESC
    `,
    { status: status || null },
  );

  sendCsv(res, 'inquiries.csv', rows);
};


