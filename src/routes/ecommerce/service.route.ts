import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';

import { ValidationSchema as ListServicesValidationSchema, Controller as ListServicesController } from '@/components/ecommerce/service/listServices.js';
import { ValidationSchema as GetServiceValidationSchema, Controller as GetServiceController } from '@/components/ecommerce/service/getService.js';

const router = express.Router();

router.route('/')
  .get(validate(ListServicesValidationSchema), WithDatabase(ListServicesController));

router.route('/:service_id')
  .get(validate(GetServiceValidationSchema), WithDatabase(GetServiceController));

export default router;
