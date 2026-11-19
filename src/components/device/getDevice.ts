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
      json_build_object(
        'id', w.id,
        'name', w.name
      ) as ward,
      json_build_object(
        'id', z.id,
        'name', z.name
      ) as zone,
      json_build_object(
        'id', fs.id,
        'name', fs.name
      ) as fire_station,
      json_build_object(
        'id', st.id,
        'name', st.name
      ) as state,
      json_build_object(
        'id', cu.id,
        'name', cu.name
      ) as customer,
      f.s3_key as noc_file_key,
      f.url as noc_file_url,
      json_build_object(
        'id', sim.id,
        'number', sim.number,
        'activation_date', sim.activation_date,
        'deactivation_date', sim.deactivation_date,
        'expiry_date', sim.expiry_date
      ) as sim_card,
      json_build_object(
        'id', s.id,
        'name', s.name
      ) as service,
      json_build_object(
        'id', o.id,
        'serial', o.serial
      ) as order
    FROM devices d
    LEFT JOIN services s ON s.id = d.service_id
    LEFT JOIN orders o ON o.id = d.order_id
    LEFT JOIN wards w ON w.id = d.ward_id
    LEFT JOIN zones z ON z.id = w.zone_id
    LEFT JOIN fire_stations fs ON fs.id = z.fire_station_id
    LEFT JOIN states st ON st.id = fs.state_id
    LEFT JOIN sim_cards sim ON sim.id = d.sim_card_id
    LEFT JOIN customers cu ON cu.id = d.customer_id
    LEFT JOIN files f ON f.id = d.noc_file_id
    WHERE d.id = $1
  `, [device_id]);

  if (!device) throw new ServerError('NOT_FOUND', 'Device not found');

  const deviceCache = memoryStorage.devices[device.imei];

  if (deviceCache) {
    device.last_record = deviceCache.last_record;
  }

  res.status(200).json(device);
};
