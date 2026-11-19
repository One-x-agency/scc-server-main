import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import { privateRoute, hasPermission } from '@/middleware/auth/index.js';

import { ValidationSchema as CreateDeviceValidationSchema, Controller as CreateDeviceController } from '@/components/device/createDevice.js';
import { ValidationSchema as ListDevicesValidationSchema, Controller as ListDevicesController } from '@/components/device/listDevices.js';
import { ValidationSchema as UpdateDeviceValidationSchema, Controller as UpdateDeviceController } from '@/components/device/updateDevice.js';
import { ValidationSchema as DeleteDeviceValidationSchema, Controller as DeleteDeviceController } from '@/components/device/deleteDevice.js';
import { ValidationSchema as UpdateDevicePinMappingValidationSchema, Controller as UpdateDevicePinMappingController } from '@/components/device/updateDevicePinMapping.js';
import { ValidationSchema as GetDeviceValidationSchema, Controller as GetDeviceController } from '@/components/device/getDevice.js';
import { ValidationSchema as ListAllDevicesForMapValidationSchema, Controller as ListAllDevicesForMapController } from '@/components/device/listAllDevicesForMap.js';

const router = express.Router();

router.route('/')
  .get(privateRoute, hasPermission('device', 1), validate(ListDevicesValidationSchema), WithDatabase(ListDevicesController))
  .post(privateRoute, hasPermission('device', 1), validate(CreateDeviceValidationSchema), WithDatabase(CreateDeviceController));

router.route('/list-all-devices-for-map')
  .get(privateRoute, hasPermission('device', 1), validate(ListAllDevicesForMapValidationSchema), WithDatabase(ListAllDevicesForMapController));

router.route('/:device_id')
  .get(privateRoute, hasPermission('device', 1), validate(GetDeviceValidationSchema), WithDatabase(GetDeviceController))
  .put(privateRoute, hasPermission('device', 2), validate(UpdateDeviceValidationSchema), WithDatabase(UpdateDeviceController))
  .delete(privateRoute, hasPermission('device', 3), validate(DeleteDeviceValidationSchema), WithDatabase(DeleteDeviceController));

router.route('/:device_id/pin-mapping')
  .put(privateRoute, hasPermission('device_configuration', 2), validate(UpdateDevicePinMappingValidationSchema), WithDatabase(UpdateDevicePinMappingController));

export default router;
