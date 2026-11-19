import express from 'express';
import { validate } from '@/utils/validationHelper.js';
import WithDatabase from '@/utils/withDatabase.js';

import { privateRoute } from '@/middleware/auth/index.js';

import { ValidationSchema as CreateUserAlertSchemaValidationSchema, Controller as CreateUserAlertSchemaController } from '@/components/user/customAlertSchema/createUserAlertSchema.js';
import { Controller as ListUserAlertSchemasController } from '@/components/user/customAlertSchema/listUserAlertSchemas.js';
import { ValidationSchema as DeleteUserAlertSchemaValidationSchema, Controller as DeleteUserAlertSchemaController } from '@/components/user/customAlertSchema/deleteUserAlertSchema.js';
import { ValidationSchema as UpdateUserAlertSchemaValidationSchema, Controller as UpdateUserAlertSchemaController } from '@/components/user/customAlertSchema/updateUserAlertSchema.js';

const router = express.Router();

router.route('/')
  .get(privateRoute, WithDatabase(ListUserAlertSchemasController))
  .post(privateRoute, validate(CreateUserAlertSchemaValidationSchema), WithDatabase(CreateUserAlertSchemaController));

router.route('/:alert_schema_id')
  .delete(privateRoute, validate(DeleteUserAlertSchemaValidationSchema), WithDatabase(DeleteUserAlertSchemaController))
  .put(privateRoute, validate(UpdateUserAlertSchemaValidationSchema), WithDatabase(UpdateUserAlertSchemaController));

export default router;
