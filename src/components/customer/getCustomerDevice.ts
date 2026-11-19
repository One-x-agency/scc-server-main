import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';
import memoryStorage from '@/service/store/inMemoryStorage.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    device_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { device_id } = req.params;

  const device = await db.queryOne(`
    SELECT
      d.*,
      w.name as ward_name,
      json_build_object(
        'id', s.id,
        'number', s.number,
        'activation_date', s.activation_date,
        'deactivation_date', s.deactivation_date,
        'expiry_date', s.expiry_date
      ) as sim_card
    FROM devices d
    LEFT JOIN wards w ON w.id = d.ward_id
    LEFT JOIN sim_cards s ON s.id = d.sim_card_id
    WHERE d.id = $1 AND d.customer_id = $2
  `, [device_id, req.customer.id]);

  if (!device) throw new ServerError('NOT_FOUND', 'Device not found');

  const deviceCache = memoryStorage.devices[device.imei];

  if (deviceCache) {
    device.last_record = deviceCache.last_record;
  }

  res.status(200).json(device);
};
