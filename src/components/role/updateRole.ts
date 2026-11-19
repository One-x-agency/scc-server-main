import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  params: Joi.object({
    role_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    name: Schema.name().required(),
    description: Schema.description().allow('', null).default(''),
  }),
};

export const Controller = async (
  req: Request,
  res: Response,
  next: NextFunction,
  db: DatabaseClient,
): Promise<void> => {
  const { role_id } = req.params as { role_id: string };
  const { name, description } = req.body as { name: string; description: string };

  await db.queryOne(
    'UPDATE roles SET name = $1, description = $2 WHERE id = $3',
    [name, description, role_id],
  );

  res.status(204).end();
};
