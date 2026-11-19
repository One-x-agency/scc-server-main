import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';
import ServerError from '@/utils/serverError.js';
import MemoryStorage from '@/service/store/inMemoryStorage.js';

export const ValidationSchema = {
  params: Joi.object({
    calibration_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { calibration_id } = req.params;

  const deletedCalibration = await db.queryOne(`
    DELETE FROM calibrations WHERE id = $1
    RETURNING id, (select imei from devices where id = calibrations.device_id) as imei
  `, [calibration_id]);

  if (!deletedCalibration) throw new ServerError('NOT_FOUND', 'Calibration not found');

  MemoryStorage.devices[deletedCalibration.imei]?.reload();

  res.status(204).end();
};
