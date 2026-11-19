import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  body: Joi.object({
    service_id: Schema.uuid().required(),
    quantity: Joi.number().integer().min(1).default(1),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { service_id, quantity } = req.body;
  const customer_id = req.customer.id;

  const cartItem = await db.queryOne(`
    INSERT INTO customer_cart_items (customer_id, service_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (customer_id, service_id)
    DO UPDATE SET quantity = $3
    RETURNING *
  `, [customer_id, service_id, quantity]);

  res.status(200).json(cartItem);
};
