import { Request, Response, NextFunction } from 'express';
import { Joi } from '@/utils/validationHelper.js';
import { DatabaseClient } from '@/service/database/index.js';
import { sendCsv } from '@/components/report/utils.js';

export const ValidationSchema = {
  query: Joi.object({
    from: Joi.date().iso(),
    to: Joi.date().iso(),
    status: Joi.string().trim().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled').allow(null),
  }),
};

export const Controller = async (req: Request & { validatedQuery?: any }, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { from, to, status } = req.validatedQuery || {};

  const rows = await db.namedQueryAll(
    `
      SELECT
        o.id,
        o.serial,
        o.customer_id,
        o.dealer_id,
        o.status,
        o.sub_total,
        o.gst_percentage,
        o.gst_amount,
        o.total,
        o.is_paid,
        o.razorpay_payment_id,
        o.razorpay_order_id,
        o.created_at,
        o.updated_at
      FROM orders o
      WHERE ($from::timestamptz IS NULL OR o.created_at >= $from::timestamptz)
        AND ($to::timestamptz IS NULL OR o.created_at <= $to::timestamptz)
        AND ($status::varchar IS NULL OR o.status = $status)
      ORDER BY o.created_at DESC
    `,
    { from: from || null, to: to || null, status: status || null },
  );

  sendCsv(res, 'orders.csv', rows);
};


