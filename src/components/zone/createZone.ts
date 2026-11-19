import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  body: Joi.object({
    name: Schema.name().required(),
    fire_station_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { name, fire_station_id } = req.body;

  const newZone = await db.queryOne(
    'INSERT INTO zones (name, fire_station_id) VALUES ($1, $2) RETURNING *',
    [name, fire_station_id],
  );

  res.status(200).json(newZone);
};
