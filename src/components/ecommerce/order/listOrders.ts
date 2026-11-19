import { NextFunction, Request, Response } from 'express';
import { DatabaseClient } from '@/service/database/index.js';

const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const orders = await db.queryAll(`
    SELECT
      orders.*,
      COUNT(order_items.id) as total_item_count
    FROM orders
    LEFT JOIN order_items ON orders.id = order_items.order_id
    WHERE
      customer_id = $1 AND is_paid = true
    GROUP BY
      orders.id
    ORDER BY
      orders.created_at desc`, [req.customer.id]);

  res.status(200).json(orders);
};

export default Controller;
