import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  params: Joi.object({
    device_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { device_id } = req.params;

  const existingDevice = await db.queryOne(
    'SELECT * FROM devices WHERE id = $1',
    [device_id],
  );

  if (!existingDevice) {
    throw new ServerError('NOT_FOUND', 'Device not found');
  }

  await db.query(
    'DELETE FROM user_device_mapping WHERE device_id = $1',
    [device_id],
  );

  await db.query(
    'DELETE FROM device_logs WHERE device_id = $1',
    [device_id],
  );

  await db.query(
    'DELETE FROM devices WHERE id = $1',
    [device_id],
  );

  res.status(204).end();
};
