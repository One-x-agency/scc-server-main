import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  body: Joi.object({
    token: Joi.string().trim().required().min(1)
      .max(1000),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { token } = req.body;
  const customer_id = req.customer.id;

  const notificationToken = await db.queryOne(`
    INSERT INTO customer_notification_tokens (customer_id, token)
    VALUES ($1, $2)
    ON CONFLICT (customer_id, token)
    DO NOTHING
    RETURNING *
  `, [customer_id, token]);

  res.status(200).json(notificationToken);
};
