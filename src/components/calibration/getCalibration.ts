import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    calibration_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { calibration_id } = req.params;

  const calibration = await db.queryOne(`
    SELECT *
    FROM calibrations
    WHERE id = $1
  `, [calibration_id]);

  if (!calibration) throw new ServerError('NOT_FOUND', 'Calibration not found');

  res.status(200).json(calibration);
};
