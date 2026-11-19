/* eslint-disable import/prefer-default-export */
import Database from '@/service/database/index.js';
import MemoryStorage from '@/service/store/inMemoryStorage.js';
import Device from './device.class.js';

type DeviceOutput = {
  id: string;
  name: string;
  imei: string;
  customer_id?: string;
  pin_mapping: {
    [key: string]: number | string;
  };
  calibrations: [
    {
      io_element_label: string;
      conversion_factor: number;
      calibration: {voltage: number, value: number}[];
    }
  ]
};

export async function getDeviceById(device_id: string): Promise<DeviceOutput | null> {
  const db = await Database.getConnection();

  try {
    const device = await db.queryOne(`
      SELECT
        d.id,
        d.name,
        d.imei,
        d.customer_id,
        d.pin_mapping,
        (

          SELECT COALESCE(
            array_agg(
              json_build_object(
                'io_element_label', io_element_label,
                'conversion_factor', conversion_factor,
                'calibration', calibration
              )
            ),
            '{}'::json[]
          )
          FROM calibrations
          WHERE device_id = d.id

        ) as calibrations
      FROM devices d
      WHERE d.id = $1
    `, [device_id]);

    return device;
  } finally {
    db.release();
  }
}

export async function getDeviceByImei(imei: string): Promise<DeviceOutput | null> {
  const db = await Database.getConnection();

  try {
    const device = await db.queryOne(`
      SELECT
        d.id,
        d.name,
        d.imei,
        d.customer_id,
        d.pin_mapping,
        (

          SELECT COALESCE(
            array_agg(
              json_build_object(
                'io_element_label', io_element_label,
                'conversion_factor', conversion_factor,
                'calibration', calibration
              )
            ),
            '{}'::json[]
          )
          FROM calibrations
          WHERE device_id = d.id

        ) as calibrations
      FROM devices d
      WHERE d.imei = $1
    `, [imei]);

    return device;
  } finally {
    db.release();
  }
}

export async function fetchDeviceByImei(imei: string): Promise<Device | null> {
  let device = MemoryStorage.devices[imei];
  if (!device) {
    const deviceInput = await getDeviceByImei(imei);
    if (!deviceInput) return null;
    device = new Device(deviceInput);
    MemoryStorage.devices[imei] = device;

  }
  return device;
}
