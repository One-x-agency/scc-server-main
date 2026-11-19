import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  params: Joi.object({
    user_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    device_ids: Joi.array().items(Schema.uuid()).min(1).required(),
  }),
};

export const Controller = async (
  req: Request,
  res: Response,
  next: NextFunction,
  db: DatabaseClient,
): Promise<void> => {
  const { user_id } = req.params as { user_id: string };
  const { device_ids } = req.body as { device_ids: string[] };

  const values = device_ids.map((_, index) => `($1, $${index + 2})`).join(', ');
  const params = [user_id, ...device_ids];

  await db.query(
    `
      INSERT INTO user_device_mapping (user_id, device_id)
      VALUES ${values}
      ON CONFLICT (user_id, device_id) DO NOTHING
    `,
    params,
  );

  res.status(204).end();

};
