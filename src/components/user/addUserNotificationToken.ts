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
  const user_id = req.user.id;

  const notificationToken = await db.queryOne(`
    INSERT INTO user_notification_tokens (user_id, token)
    VALUES ($1, $2)
    ON CONFLICT (user_id, token)
    DO NOTHING
    RETURNING *
  `, [user_id, token]);

  res.status(200).json(notificationToken);
};
