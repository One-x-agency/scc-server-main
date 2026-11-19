import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  body: Joi.object({
    service_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const customer_id = req.customer.id;
  const { service_id } = req.body;
  try {

    const cartItem = await db.queryOne(
      'SELECT * FROM customer_cart_items WHERE customer_id = $1 AND service_id = $2',
      [customer_id, service_id],
    );

    if (!cartItem) {
      throw new ServerError('NOT_FOUND', 'Cart item not found');
    }

    await db.query('DELETE FROM customer_cart_items WHERE id = $1', [cartItem.id]);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
