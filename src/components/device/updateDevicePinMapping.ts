import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import MemoryStorage from '@/service/store/inMemoryStorage.js';

export const ValidationSchema = {
  params: Joi.object({
    device_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    pin_mapping: Schema.ioElement.pinMapping(),
  }).min(1),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { device_id } = req.params;
  const { pin_mapping } = req.body;

  let setClause = '';
  if (pin_mapping) setClause += 'pin_mapping = $pin_mapping,';

  const device = await db.namedQueryOne(
    `
      UPDATE devices
      SET
        ${setClause}
        updated_by = $updated_by,
        updated_at = current_timestamp
      WHERE id = $device_id
      RETURNING *
    `,
    {
      pin_mapping,
      updated_by: req.user.id,
      device_id,
    },
  );

  if (!device) throw new ServerError('NOT_FOUND', 'Device not found');

  MemoryStorage.devices[device.imei]?.reload();

  res.status(204).end();
};
