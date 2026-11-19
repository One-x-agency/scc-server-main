import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  query: Joi.object({
    device_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { device_id } = req.validatedQuery as { device_id: string };

  const calibrations = await db.queryAll(`
    SELECT * FROM calibrations WHERE device_id = $1
  `, [device_id]);

  res.status(200).json(calibrations);
};
