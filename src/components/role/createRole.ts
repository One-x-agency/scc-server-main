import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
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

  const { name, description } = req.body as {
    name: string;
    description?: string | null;
  };

  const role = await db.queryOne(
    'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *',
    [name, description],
  );

  res.status(200).json(role);

};
