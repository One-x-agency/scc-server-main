import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    order_id: Schema.uuid().required(),
  }),
};
export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { order_id } = req.params;

  const order = await db.queryOne(`
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
      WHERE
        o.id = $1
    `, [order_id]);

  if (!order) throw new ServerError('NOT_FOUND', 'Order not found');

  const orderItems = await db.queryAll(`
    SELECT
      s.*,
      array_agg(
        jsonb_build_object(
          'id', f.id,
          'url', f.url
        )
      ) as images,
      oi.quantity,
      (oi.price / 100)::numeric as price
    FROM order_items oi
    LEFT JOIN services s ON oi.service_id = s.id
    LEFT JOIN service_images si ON si.service_id = s.id
    LEFT JOIN files f ON si.file_id = f.id
    WHERE
      oi.order_id = $1
    GROUP BY s.id, oi.id
  `, [order_id]);

  const orderStatusLogs = await db.queryAll(`
    SELECT
      os.*,
      jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'is_root_user', u.is_root_user
      ) as created_by
    FROM order_status_logs os
    LEFT JOIN users u ON os.created_by = u.id
    WHERE os.order_id = $1
  `, [order_id]);

  const response = {
    ...order,
    items: orderItems,
    status_logs: orderStatusLogs,
  };

  res.status(200).json(response);
};
