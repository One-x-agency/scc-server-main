import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  body: Joi.object({
    name: Schema.name().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { name } = req.body;

  const newDistrict = await db.queryOne(
    'INSERT INTO districts (name) VALUES ($1) RETURNING *',
    [name],
  );

  res.status(200).json(newDistrict);
};
