import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import { isCustomerLoggedIn, privateRoute, hasPermission } from '@/middleware/auth/index.js';

import { ValidationSchema as ListCustomersValidationSchema, Controller as ListCustomersController } from '@/components/customer/listCustomers.js';
import { Controller as ListCustomerDevicesController } from '@/components/customer/listCustomerDevices.js';
import { ValidationSchema as GetCustomerDeviceValidationSchema, Controller as GetCustomerDeviceController } from '@/components/customer/getCustomerDevice.js';
import { ValidationSchema as GetCustomerValidationSchema, Controller as GetCustomerController } from '@/components/customer/getCustomer.js';
import { ValidationSchema as SendNotificationValidationSchema, Controller as SendNotificationController } from '@/components/customer/sendNotification.js';

const router = express.Router();

router.route('/')
  .get(privateRoute, hasPermission('customer', 1), validate(ListCustomersValidationSchema), WithDatabase(ListCustomersController));

router.route('/devices')
  .get(isCustomerLoggedIn, WithDatabase(ListCustomerDevicesController));

router.route('/devices/:device_id')
  .get(isCustomerLoggedIn, validate(GetCustomerDeviceValidationSchema), WithDatabase(GetCustomerDeviceController));

router.route('/:customer_id')
  .get(privateRoute, hasPermission('customer', 1), validate(GetCustomerValidationSchema), WithDatabase(GetCustomerController));

router.route('/:customer_id/notification')
  .post(validate(SendNotificationValidationSchema), WithDatabase(SendNotificationController));

export default router;
