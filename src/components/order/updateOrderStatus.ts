import { Request, Response, NextFunction } from 'express';
import z from 'zod';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: z.object({
    order_id: z.uuid({ version: 'v4', message: 'Invalid order ID' }),
  }),
  body: z.object({
    status: z.enum(['pending', 'processing', 'assigned', 'installed']),
    remark: z.string().trim().max(1000).nullish(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { order_id } = req.params as z.infer<typeof ValidationSchema.params>;
  const { status, remark } = req.body as z.infer<typeof ValidationSchema.body>;

  try {
    // Begin transaction
    await db.query('BEGIN');

    // Check if order exists
    const existingOrder = await db.queryOne(
      'SELECT * FROM orders WHERE id = $1',
      [order_id],
    );

    if (!existingOrder) throw new ServerError('NOT_FOUND', 'Order not found');

    if (existingOrder.status === 'completed') throw new ServerError('FORBIDDEN', 'Order is completed and cannot be updated');

    // Update order status
    const updatedOrder = await db.queryOne(
      `
        UPDATE orders
        SET status = $1, updated_at = current_timestamp, updated_by = $2
        WHERE id = $3
        RETURNING *
      `,
      [status, req.user?.id, order_id],
    );

    await db.query(
      `
        INSERT INTO order_status_logs (order_id, status, remark, created_by)
        VALUES ($1, $2, $3, $4)
      `,
      [order_id, status, remark, req.user?.id],
    );

    // Commit transaction
    await db.query('COMMIT');

    res.status(200).json(updatedOrder);
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    throw error;
  }
};
