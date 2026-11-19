import { Request, Response, NextFunction } from 'express';
import z from 'zod';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import JWT from '@/utils/jwtToken.js';

export const ValidationSchema = {
  body: z.object({
    token: z.string().max(2000, 'Token must be less than 2000 characters'),
    otp: z.string().trim().nonempty('OTP is required').regex(/^[0-9]{6}$/, 'OTP must be 6 digits'),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { token, otp } = req.body as z.infer<typeof ValidationSchema.body>;

  try {
    await db.query('BEGIN');

    // Decode and validate JWT token
    const decoded = JWT.decode(token);
    if (!decoded) throw new ServerError('ERROR', 'Token is not valid');
    if (decoded.type !== 'order_completion_token') throw new ServerError('ERROR', 'Invalid token type');
    if (!decoded.order_id) throw new ServerError('ERROR', 'Order ID is missing in token');

    const { order_id } = decoded;

    // Verify token exists and hasn't expired
    const tokenData = await db.queryOne(
      'SELECT * FROM tokens WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP',
      [token],
    );

    if (!tokenData) throw new ServerError('ERROR', 'Token is expired or invalid');

    // Verify OTP matches
    if (tokenData.value !== otp) throw new ServerError('ERROR', 'Invalid OTP');

    // Check if order exists
    const existingOrder = await db.queryOne('SELECT id, status FROM orders WHERE id = $1', [order_id]);
    if (!existingOrder) throw new ServerError('NOT_FOUND', 'Order not found');
    if (existingOrder.status === 'completed') throw new ServerError('FORBIDDEN', 'Order is already completed');

    // Update order status to completed
    await db.queryOne(
      `
        UPDATE orders
        SET status = $1, updated_at = current_timestamp, updated_by = $3
        WHERE id = $2
      `,
      ['completed', order_id, req.user.id],
    );

    // Log status change (created_by is null for customer-initiated actions)
    await db.query(
      `
        INSERT INTO order_status_logs (order_id, status, remark, created_by)
        VALUES ($1, $2, $3, $4)
      `,
      [order_id, 'completed', 'Order completed via OTP verification', req.user.id],
    );

    // Delete the used token
    await db.query('DELETE FROM tokens WHERE token = $1', [token]);

    await db.query('COMMIT');

    res.status(204).end();
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
};
