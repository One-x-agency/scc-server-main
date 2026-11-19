import { Record, ProcessedRecord } from '@/types/device.type.js';
import { getDeviceById } from './device.service.js';
import Customer from '@/components/customer/customer.class.js';
import { fetchCustomerById } from '@/components/customer/customer.service.js';
import { fetchUsersByAssignedDeviceId } from '@/components/user/user.service.js';
import User from '@/components/user/user.class.js';

function mapCalibration(voltage: number, calibration: {voltage: number, value: number}[]): number {

  if (calibration.length < 2) throw new Error('Calibration must be an array with at least two points.');

  // If voltage is below the first calibration point → extrapolate down
  if (voltage <= calibration[0].voltage) {
    const p1 = calibration[0];
    const p2 = calibration[1];
    const slope = (p2.value - p1.value) / (p2.voltage - p1.voltage);
    return p1.value + (voltage - p1.voltage) * slope;
  }

  // If voltage is above the last calibration point → extrapolate up
  if (voltage >= calibration[calibration.length - 1].voltage) {
    const p1 = calibration[calibration.length - 2];
    const p2 = calibration[calibration.length - 1];
    const slope = (p2.value - p1.value) / (p2.voltage - p1.voltage);
    return p2.value + (voltage - p2.voltage) * slope;
  }

  // Otherwise, interpolate between the two surrounding points
  for (let i = 0; i < calibration.length - 1; i += 1) {
    const p1 = calibration[i];
    const p2 = calibration[i + 1];

    if (voltage >= p1.voltage && voltage <= p2.voltage) {
      const slope = (p2.value - p1.value) / (p2.voltage - p1.voltage);
      return p1.value + (voltage - p1.voltage) * slope;
    }
  }

  // Should never reach here
  throw new Error('Unable to calculate fuel level.');
}

export type DeviceInput = {
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

function convertCalibrationsToObject(calibrations: DeviceInput['calibrations']) {
  return calibrations.reduce((acc, calibration) => {

    acc[calibration.io_element_label] = {
      conversion_factor: calibration.conversion_factor,
      calibration: calibration.calibration.sort((a, b) => a.voltage - b.voltage),
    };

    return acc;
  }, {} as {[key: string]: {conversion_factor: number; calibration: {voltage: number, value: number}[]}});
}

class Device {
  id: string;

  imei: string;

  customer_id?: string;

  pin_mapping: DeviceInput['pin_mapping'];

  last_record: ProcessedRecord;

  system_status: string;

  calibrations: {
    [key: string]: {
      conversion_factor: number;
      calibration: {voltage: number, value: number}[];
    };
  };

  constructor(data: DeviceInput) {
    this.id = data.id;
    this.imei = data.imei;
    this.customer_id = data.customer_id;
    this.pin_mapping = data.pin_mapping;
    this.last_record = null;
    this.system_status = 'inactive';

    this.calibrations = convertCalibrationsToObject(data.calibrations);
  }

  /**
  * will convert io_element_ids to the actual labels and apply the calibrations if any.
  * @param record
  * @returns
  */
  parseRecord(record: Record): Record {

    const ioElements = Object.keys(record.io_elements).reduce((acc, key) => {
      if (this.pin_mapping[key]) {
        acc[this.pin_mapping[key]] = record.io_elements[key];
      }
      return acc;
    }, {}) as {[key: string]: number};

    Object.keys(ioElements).forEach((key) => {
      if (this.calibrations[key]) {
        ioElements[key] = mapCalibration(ioElements[key] * this.calibrations[key].conversion_factor, this.calibrations[key].calibration);
      }
    });

    return { ...record, io_elements: ioElements };
  }

  async getCustomer(): Promise<Customer | null> {
    if (!this.customer_id) return null;
    const customer = await fetchCustomerById(this.customer_id);
    return customer;
  }

  async getUsers(): Promise<User[]> {
    const users = await fetchUsersByAssignedDeviceId(this.id);
    return users;
  }

  async reload() {
    const device = await getDeviceById(this.id);
    if (!device) throw new Error('Device not found');
    this.id = device.id;
    this.imei = device.imei;
    this.pin_mapping = device.pin_mapping;
    this.calibrations = convertCalibrationsToObject(device.calibrations);
    this.system_status = 'healthy';
    this.customer_id = device.customer_id;
  }

}

export default Device;
