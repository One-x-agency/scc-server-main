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
        orders.* ,
        customers.name as customer_name,
        customers.phone_number as customer_phone_number,
        dealers.name as dealer_name,
        dealers.phone_number as dealer_phone_number,
        JSON_BUILD_OBJECT(
          'id', shipping_state.id,
          'name', shipping_state.name,
          'gst_code', shipping_state.gst_code
        ) as shipping_state,
        JSON_BUILD_OBJECT(
          'id', billing_state.id,
          'name', billing_state.name,
          'gst_code', billing_state.gst_code
        ) as billing_state
      FROM orders
      LEFT JOIN customers ON orders.customer_id = customers.id
      LEFT JOIN dealers ON orders.dealer_id = dealers.id
      LEFT JOIN states shipping_state ON orders.shipping_state_id = shipping_state.id
      LEFT JOIN states billing_state ON orders.billing_state_id = billing_state.id
      WHERE
        orders.id = $1
    `, [order_id]);

  if (!order) throw new ServerError('NOT_FOUND', 'Order not found');

  const orderItems = await db.queryAll(`
    SELECT
      s.*,
      oi.quantity,
      oi.price,
      oi.gst_percentage,
      (oi.price / 100)::numeric as price_in_rupees,
      array_agg(
        jsonb_build_object(
          'id', f.id,
          'url', f.url
        )
      ) as images
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
      os.*
    FROM order_status_logs os
    WHERE os.order_id = $1
  `, [order_id]);

  const orderItemsWithGst = orderItems.map((item) => {
    const { price } = item;
    const subTotal = price * item.quantity;
    const gstAmount = (subTotal * item.gst_percentage) / 100;
    const total = subTotal + gstAmount;

    return {
      ...item,
      price,
      sub_total: subTotal,
      gst_amount: gstAmount,
      total,
    };

  });

  const response = {
    ...order,
    items: orderItemsWithGst,
    status_logs: orderStatusLogs,
  };

  res.status(200).json(response);
};
