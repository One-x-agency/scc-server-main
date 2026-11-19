import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import crypto from 'crypto';
import { DatabaseClient } from '@/service/database/index.js';
import Vars from '@/config/var.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  body: Joi.object({
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const signData = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac('sha256', Vars.razorpay.keySecret)
    .update(signData)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) throw new ServerError('ERROR', 'Invalid signature');

  const order = await db.queryOne('SELECT * FROM orders WHERE razorpay_order_id = $1', [razorpay_order_id]);
  if (!order) throw new ServerError('ERROR', 'Order not found');

  try {
    await db.query('BEGIN');

    if (!order.is_paid) {
      const updatedOrder = await db.queryOne(`
          UPDATE orders
          SET
            is_paid = true,
            razorpay_payment_id = $1,
            razorpay_signature = $2
          WHERE id = $3
          RETURNING *, dealer_id
        `, [razorpay_payment_id, razorpay_signature, order.id]);

      if (updatedOrder.dealer_id) {
        const dealer = await db.queryOne('SELECT * FROM dealers WHERE id = $1', [updatedOrder.dealer_id]);
        if (dealer) {
          const TaxableAmount = updatedOrder.total / 1.18;
          const commissionAmount = Math.round((TaxableAmount * dealer.commission_percentage) / 100);
          await db.query('UPDATE dealers SET balance = balance + $1 WHERE id = $2', [commissionAmount, dealer.id]);
        }
      }
    }

    await db.query('DELETE FROM customer_cart_items WHERE customer_id = $1', [order.customer_id]);

    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }

  res.status(200).json(order);
};
