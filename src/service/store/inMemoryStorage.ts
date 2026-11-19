import Device from '@/components/device/device.class.js';
import Customer from '@/components/customer/customer.class.js';

const memoryStorage : {
  devices: {
    [key: string]: Device;
  };
  customers: {
    [key: string]: Customer;
  };

} = {
  devices: {},
  customers: {},

};

export default memoryStorage;
