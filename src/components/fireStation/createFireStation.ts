import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  body: Joi.object({
    name: Schema.name().required(),
    state_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { name, state_id } = req.body;

  const newFireStation = await db.queryOne(
    'INSERT INTO fire_stations (name, state_id) VALUES ($1, $2) RETURNING *',
    [name, state_id],
  );

  res.status(200).json(newFireStation);
};
