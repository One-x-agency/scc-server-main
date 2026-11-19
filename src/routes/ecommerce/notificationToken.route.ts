import express from 'express';
import { validate } from '@/utils/validationHelper.js';
import WithDatabase from '@/utils/withDatabase.js';
import { isCustomerLoggedIn } from '@/middleware/auth/index.js';

import { ValidationSchema as AddCustomerNotificationTokenValidationSchema, Controller as AddCustomerNotificationTokenController } from '@/components/ecommerce/notificationToken/addCustomerNotificationToken.js';

const router = express.Router();

router.route('/')
  .post(isCustomerLoggedIn, validate(AddCustomerNotificationTokenValidationSchema), WithDatabase(AddCustomerNotificationTokenController));

export default router;
