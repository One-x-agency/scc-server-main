import express from 'express';
import { validate } from '@/utils/validationHelper.js';
import WithDatabase from '@/utils/withDatabase.js';

import { ValidationSchema as ListServicesValidationSchema, Controller as ListServicesController } from '@/components/service/listServices.js';
import { ValidationSchema as GetServiceValidationSchema, Controller as GetServiceController } from '@/components/service/getService.js';

const router = express.Router();

router.route('/')
  .get(validate(ListServicesValidationSchema), WithDatabase(ListServicesController));

router.route('/:service_id')
  .get(validate(GetServiceValidationSchema), WithDatabase(GetServiceController));

export default router;
