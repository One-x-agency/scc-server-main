import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  body: Joi.object({
    name: Schema.name().required(),
    district_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { name, district_id } = req.body;

  const newCity = await db.queryOne(
    'INSERT INTO cities (name, district_id) VALUES ($1, $2) RETURNING *',
    [name, district_id],
  );

  res.status(200).json(newCity);
};
