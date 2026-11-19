import { Request, Response, NextFunction } from 'express';
import { Joi } from '@/utils/validationHelper.js';
import { DatabaseClient } from '@/service/database/index.js';
import { sendCsv } from '@/components/report/utils.js';

export const ValidationSchema = {
  query: Joi.object({
    from: Joi.date().iso(),
    to: Joi.date().iso(),
  }),
};

export const Controller = async (req: Request & { validatedQuery?: any }, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { from, to } = req.validatedQuery || {};

  const rows = await db.namedQueryAll(
    `
      SELECT
        o.id as order_id,
        o.serial,
        o.total,
        o.is_paid,
        o.razorpay_payment_id,
        o.razorpay_order_id,
        o.razorpay_signature,
        o.created_at
      FROM orders o
      WHERE o.is_paid = true
        AND ($from::timestamptz IS NULL OR o.created_at >= $from::timestamptz)
        AND ($to::timestamptz IS NULL OR o.created_at <= $to::timestamptz)
      ORDER BY o.created_at DESC
    `,
    { from: from || null, to: to || null },
  );

  sendCsv(res, 'payments.csv', rows);
};


