import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';
import MemoryStorage from '@/service/store/inMemoryStorage.js';

export const ValidationSchema = {
  body: Joi.object({
    device_id: Schema.uuid().required(),
    io_element_label: Schema.ioElement.label().required(),
    conversion_factor: Joi.number().required(),
    calibration: Schema.calibration().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { device_id, io_element_label, conversion_factor, calibration } = req.body;

  const newCalibration = await db.queryOne(`
    INSERT INTO calibrations
      (device_id, io_element_label, conversion_factor, calibration)
    VALUES
      ($1, $2, $3, $4)
    RETURNING *, (select imei from devices where id = $1) as imei
  `, [device_id, io_element_label, conversion_factor, calibration]);

  MemoryStorage.devices[newCalibration.imei]?.reload();

  res.status(200).json(newCalibration);
};
