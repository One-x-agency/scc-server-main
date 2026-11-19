import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import MemoryStorage from '@/service/store/inMemoryStorage.js';
import SocketService from '@/service/socket/index.js';
import Vars from '@/config/var.js';

export const ValidationSchema = {
  params: Joi.object({
    device_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    imei: Schema.imei().required(),
    name: Schema.name().allow(null, ''),
    ward_id: Schema.uuid().allow(null),
    description: Schema.remark().allow('').default(''),
    sim_card_id: Schema.uuid().allow(null),
    customer_id: Schema.uuid().allow(null),
    brand: Joi.string().trim().max(255).allow(null, ''),
    model_number: Joi.string().trim().max(255).allow(null, ''),
    system_type: Schema.device.systemType().allow(null),
    pumps: Schema.device.pumps().default([]),
    occupancy_type: Schema.device.occupancyType().allow(null),
    number_of_floors: Joi.number().min(1).max(1000).allow(null),
    number_of_blocks: Joi.number().min(1).max(1000).allow(null),
    number_of_zones: Joi.number().min(1).max(50).allow(null),
    address: Joi.string().trim().max(1000).allow('', null),
    latitude: Joi.number().min(-90).max(90).allow(null),
    longitude: Joi.number().min(-180).max(180).allow(null),
    noc_expires_at: Joi.date().allow(null),
    noc_file_key: Joi.string().trim().max(2000).allow(null, ''),
    alternative_contacts: Schema.device.alternative_contacts().default([]),
    service_id: Schema.uuid().allow(null),
    order_id: Schema.uuid().allow(null),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { device_id } = req.params;
  const {
    ward_id, imei, name, description, sim_card_id, customer_id,
    brand, model_number, system_type, pumps, occupancy_type,
    number_of_floors, number_of_blocks, address, latitude, longitude,
    number_of_zones, noc_expires_at, noc_file_key,
    alternative_contacts,
    service_id,
    order_id,
  } = req.body;

  const existingDevice = await db.queryOne(`
      SELECT
        d.id,
        d.imei,
        d.noc_file_id,
        f.s3_key as noc_file_key
      FROM devices d
      LEFT JOIN files f ON f.id = d.noc_file_id
      WHERE d.id = $1
    `, [device_id]);

  if (!existingDevice) throw new ServerError('NOT_FOUND', 'Device not found');

  let new_noc_file_id = existingDevice.noc_file_id;

  if (!noc_file_key) {
    new_noc_file_id = null;
  } else if (existingDevice.noc_file_key !== noc_file_key) {
    const newFile = await db.queryOne(`
      INSERT INTO files (s3_key, url) VALUES ($1, $2) RETURNING *
    `, [noc_file_key, `${Vars.aws.s3Bucket}.s3.${Vars.aws.region}.amazonaws.com/${noc_file_key}`]);

    new_noc_file_id = newFile.id;
  }

  const device = await db.namedQueryOne(
    `
      UPDATE devices
      SET
        ward_id = $ward_id,
        imei = $imei,
        name = $name,
        description = $description,
        updated_by = $updated_by,
        updated_at = current_timestamp,
        sim_card_id = $sim_card_id,
        customer_id = $customer_id,
        brand = $brand,
        model_number = $model_number,
        system_type = $system_type,
        pumps = $pumps::jsonb,
        occupancy_type = $occupancy_type,
        number_of_floors = $number_of_floors,
        number_of_blocks = $number_of_blocks,
        address = $address,
        latitude = $latitude,
        longitude = $longitude,
        number_of_zones = $number_of_zones,
        noc_expires_at = $noc_expires_at,
        noc_file_id = $noc_file_id,
        alternative_contacts = $alternative_contacts::jsonb,
        service_id = $service_id,
        order_id = $order_id
      WHERE id = $device_id
      RETURNING *
    `,
    {
      ward_id,
      imei,
      name,
      description,
      updated_by: req.user?.id,
      device_id,
      sim_card_id,
      customer_id,
      brand,
      model_number,
      system_type,
      pumps: JSON.stringify(pumps),
      occupancy_type,
      number_of_floors,
      number_of_blocks,
      address,
      latitude,
      longitude,
      alternative_contacts: JSON.stringify(alternative_contacts),
      number_of_zones,
      noc_expires_at,
      noc_file_id: new_noc_file_id,
      service_id,
      order_id,
    },
  );

  if (noc_file_key !== existingDevice.noc_file_key) {
    await db.query('UPDATE files SET status = $1 WHERE id = $2', ['deleted', existingDevice.noc_file_id]);
  }

  if (!device) {
    throw new ServerError('NOT_FOUND', 'Device not found');
  }

  if (existingDevice.imei !== device.imei) {

    // TODO: can be improved (later)
    // transfer the socket to the new device
    const room = SocketService.io?.sockets.adapter.rooms.get(existingDevice.imei);
    if (room) {
      room.forEach((socketId) => {
        const socket = SocketService.io?.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave(existingDevice.imei);
          socket.join(device.imei);
        }
      });
    }

    MemoryStorage.devices[imei] = MemoryStorage.devices[existingDevice.imei];
    delete MemoryStorage.devices[existingDevice.imei];
    MemoryStorage.devices[imei]?.reload();
  }

  res.status(204).end();
};
