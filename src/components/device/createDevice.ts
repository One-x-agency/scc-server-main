import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import MemoryStorage from '@/service/store/inMemoryStorage.js';
import Device, { DeviceInput } from '@/components/device/device.class.js';
import Vars from '@/config/var.js';

export const ValidationSchema = {
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
  const {
    ward_id, imei, name, description, sim_card_id, customer_id,
    brand, model_number, system_type, pumps, occupancy_type,
    number_of_floors, number_of_blocks, address, latitude, longitude,
    number_of_zones,
    noc_expires_at, noc_file_key,
    alternative_contacts,
    service_id,
    order_id,
  } = req.body;

  let newFile = null;

  if (noc_file_key) {
    newFile = await db.queryOne(`
    INSERT INTO files (
      s3_key,
      url
    )
    VALUES ($1, $2)
    RETURNING *
  `, [noc_file_key, `${Vars.aws.s3Bucket}.s3.${Vars.aws.region}.amazonaws.com/${noc_file_key}`]);
  }
  const newDevice = await db.namedQueryOne(
    `
      INSERT INTO devices (
        ward_id,
        imei,
        name,
        description,
        created_by,
        sim_card_id,
        customer_id,
        serial_number,
        brand,
        model_number,
        system_type,
        pumps,
        occupancy_type,
        number_of_floors,
        number_of_blocks,
        address,
        latitude,
        longitude,
        number_of_zones,
        noc_expires_at,
        noc_file_id,
        alternative_contacts,
        service_id,
        order_id
      )
      VALUES (
        $ward_id,
        $imei,
        $name,
        $description,
        $created_by,
        $sim_card_id,
        $customer_id,
        COALESCE((SELECT MAX(serial_number) + 1 FROM devices), 1),
        $brand,
        $model_number,
        $system_type,
        $pumps::jsonb,
        $occupancy_type,
        $number_of_floors,
        $number_of_blocks,
        $address,
        $latitude,
        $longitude,
        $number_of_zones,
        $noc_expires_at,
        $noc_file_id,
        $alternative_contacts::jsonb,
        $service_id,
        $order_id
      ) RETURNING *
    `,
    {
      ward_id,
      imei,
      name,
      description,
      created_by: req.user?.id,
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
      number_of_zones,
      noc_expires_at,
      noc_file_id: newFile?.id,
      alternative_contacts: JSON.stringify(alternative_contacts),
      service_id,
      order_id,
    },
  );

  MemoryStorage.devices[imei] = new Device({
    id: newDevice.id,
    name: newDevice.name,
    imei,
    pin_mapping: {},
    calibrations: [] as unknown as DeviceInput['calibrations'],
  });

  res.status(200).json(newDevice);
};
