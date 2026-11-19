import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import { privateRoute, hasPermission } from '@/middleware/auth/index.js';

import { ValidationSchema as CreateDealerValidationSchema, Controller as CreateDealerController } from '@/components/dealers/createDealer.js';
import { ValidationSchema as ListDealersValidationSchema, Controller as ListDealersController } from '@/components/dealers/listDealers.js';
import { ValidationSchema as UpdateDealerValidationSchema, Controller as UpdateDealerController } from '@/components/dealers/updateDealer.js';
import { ValidationSchema as GetDealerValidationSchema, Controller as GetDealerController } from '@/components/dealers/getDealer.js';
import { ValidationSchema as DeleteDealerValidationSchema, Controller as DeleteDealerController } from '@/components/dealers/deleteDealer.js';

const router = express.Router();

router.route('/')
  .get(privateRoute, hasPermission('dealer', 1), validate(ListDealersValidationSchema), WithDatabase(ListDealersController))
  .post(privateRoute, hasPermission('dealer', 3), validate(CreateDealerValidationSchema), WithDatabase(CreateDealerController));

router.route('/:dealer_id')
  .get(privateRoute, hasPermission('dealer', 1), validate(GetDealerValidationSchema), WithDatabase(GetDealerController))
  .put(privateRoute, hasPermission('dealer', 2), validate(UpdateDealerValidationSchema), WithDatabase(UpdateDealerController))
  .delete(privateRoute, hasPermission('dealer', 3), validate(DeleteDealerValidationSchema), WithDatabase(DeleteDealerController));

export default router;
