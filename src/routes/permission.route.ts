import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import { privateRoute } from '@/middleware/auth/index.js';

import { ValidationSchema as ListPermissionsValidationSchema, Controller as ListPermissionsController } from '@/components/permission/listPermissions.js';

const router = express.Router();

router.route('/')
  .get(privateRoute, validate(ListPermissionsValidationSchema), WithDatabase(ListPermissionsController));

export default router;
