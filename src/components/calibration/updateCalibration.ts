import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';
import MemoryStorage from '@/service/store/inMemoryStorage.js';

export const ValidationSchema = {
  body: Joi.object({
    io_element_label: Schema.ioElement.label().required(),
    conversion_factor: Joi.number().required(),
    calibration: Schema.calibration().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { io_element_label, conversion_factor, calibration } = req.body;

  const newCalibration = await db.queryOne(`
    UPDATE calibrations
    SET
      conversion_factor = $2,
      calibration = $3
    WHERE io_element_label = $1
    RETURNING *, (select imei from devices where id = calibrations.device_id) as imei
  `, [io_element_label, conversion_factor, calibration]);

  MemoryStorage.devices[newCalibration.imei]?.reload();

  res.status(200).json(newCalibration);
};
