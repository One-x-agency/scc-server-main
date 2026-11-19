import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { isCustomerLoggedIn } from '@/middleware/auth/index.js';

import { ValidationSchema as DeviceLogsValidationSchema, Controller as DeviceLogsController } from '@/components/ecommerce/report/deviceLogsReport.js';
import { validate } from '@/utils/validationHelper.js';

const router = express.Router();

router.route('/device-logs')
  .get(isCustomerLoggedIn, validate(DeviceLogsValidationSchema), WithDatabase(DeviceLogsController));

export default router;
