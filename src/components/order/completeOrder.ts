import { Request, Response, NextFunction } from 'express';
import z from 'zod';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import JWT from '@/utils/jwtToken.js';
import { SendMail } from '@/service/mail/index.js';
import orderCompletionConfirmation from '@/utils/emailTemplates/orderCompletionConfirmation.js';

export const ValidationSchema = {
  params: z.object({
    order_id: z.uuid({ version: 'v4', message: 'Invalid order ID' }),
  }),
};

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { order_id } = req.params as z.infer<typeof ValidationSchema.params>;

  try {
    await db.query('BEGIN');

    const existingOrder = await db.queryOne(`
      SELECT
        o.id,
        o.status,
        c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      WHERE o.id = $1
    `, [order_id]);
    if (!existingOrder) throw new ServerError('NOT_FOUND', 'Order not found');
    if (existingOrder.status === 'completed') throw new ServerError('FORBIDDEN', 'Order is completed and cannot be completed');

    const payload = {
      type: 'order_completion_token',
      order_id,
    };

    const token = JWT.encode(payload, { expiresIn: '10m' });

    const otp = generateOtp();

    await db.queryOne(`
      INSERT INTO tokens (token, value, expires_at)
      VALUES ($1, $2, $3)
    `, [token, otp, new Date(Date.now() + 10 * 60 * 1000).toISOString()]);

    SendMail(existingOrder.customer_email, 'Order Completion', orderCompletionConfirmation(otp.toString()));

    res.status(200).json({
      token,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      message: 'Order completion OTP sent to customer email',
    });
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }

};
