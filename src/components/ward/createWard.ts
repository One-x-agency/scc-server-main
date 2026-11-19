import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  body: Joi.object({
    name: Schema.name().required(),
    zone_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { name, zone_id } = req.body;

  const newWard = await db.queryOne(
    'INSERT INTO wards (name, zone_id) VALUES ($1, $2) RETURNING *',
    [name, zone_id],
  );

  res.status(200).json(newWard);
};
