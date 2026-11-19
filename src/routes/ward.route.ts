import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import { privateRoute, hasPermission } from '@/middleware/auth/index.js';

import { ValidationSchema as CreateWardValidationSchema, Controller as CreateWardController } from '@/components/ward/createWard.js';
import { ValidationSchema as ListWardsValidationSchema, Controller as ListWardsController } from '@/components/ward/listWards.js';
import { ValidationSchema as UpdateWardValidationSchema, Controller as UpdateWardController } from '@/components/ward/updateWard.js';
import { ValidationSchema as DeleteWardValidationSchema, Controller as DeleteWardController } from '@/components/ward/deleteWard.js';

const router = express.Router();

router.route('/')
  .get(privateRoute, hasPermission('location', 1), validate(ListWardsValidationSchema), WithDatabase(ListWardsController))
  .post(privateRoute, hasPermission('location', 3), validate(CreateWardValidationSchema), WithDatabase(CreateWardController));

router.route('/:ward_id')
  .put(privateRoute, hasPermission('location', 2), validate(UpdateWardValidationSchema), WithDatabase(UpdateWardController))
  .delete(privateRoute, hasPermission('location', 3), validate(DeleteWardValidationSchema), WithDatabase(DeleteWardController));

export default router;
