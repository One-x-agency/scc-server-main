import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import { isCustomerLoggedIn } from '@/middleware/auth/index.js';

import { Controller as ListDevicesController } from '@/components/ecommerce/device/listDevices.js';
import { ValidationSchema as GetDeviceValidationSchema, Controller as GetDeviceController } from '@/components/ecommerce/device/getDevice.js';
import { Controller as ListAllDevicesForMapController } from '@/components/ecommerce/device/listAllDevicesForMap.js';
import { ValidationSchema as UpdateDeviceAlternativeContactValidationSchema, Controller as UpdateDeviceAlternativeContactController } from '@/components/ecommerce/device/updateDeviceAlternativeContact.js';

const router = express.Router();

router.route('/')
  .get(isCustomerLoggedIn, WithDatabase(ListDevicesController));

router.route('/list-all-devices-for-map')
  .get(isCustomerLoggedIn, WithDatabase(ListAllDevicesForMapController));

router.route('/:device_id')
  .get(validate(GetDeviceValidationSchema), isCustomerLoggedIn, WithDatabase(GetDeviceController));

router.route('/:device_id/alternative-contacts')
  .put(validate(UpdateDeviceAlternativeContactValidationSchema), isCustomerLoggedIn, WithDatabase(UpdateDeviceAlternativeContactController));

export default router;
