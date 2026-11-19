import express from 'express';
import { validate } from '@/utils/validationHelper.js';
import WithDatabase from '@/utils/withDatabase.js';
import { isCustomerLoggedIn } from '@/middleware/auth/index.js';

import { Controller as ListCustomAlertSchemasController } from '@/components/ecommerce/alert/listCustomAlertSchemas.js';
import { ValidationSchema as CreateCustomAlertSchemaValidationSchema, Controller as CreateCustomAlertSchemaController } from '@/components/ecommerce/alert/createCustomAlertSchema.js';
import { ValidationSchema as UpdateCustomAlertSchemaValidationSchema, Controller as UpdateCustomAlertSchemaController } from '@/components/ecommerce/alert/updateCustomAlertSchema.js';
import { ValidationSchema as DeleteCustomAlertSchemaValidationSchema, Controller as DeleteCustomAlertSchemaController } from '@/components/ecommerce/alert/deleteCustomAlertSchema.js';

const router = express.Router();

router.route('/')
  .get(isCustomerLoggedIn, WithDatabase(ListCustomAlertSchemasController))
  .post(isCustomerLoggedIn, validate(CreateCustomAlertSchemaValidationSchema), WithDatabase(CreateCustomAlertSchemaController));

router.route('/:custom_alert_schema_id')
  .put(isCustomerLoggedIn, validate(UpdateCustomAlertSchemaValidationSchema), WithDatabase(UpdateCustomAlertSchemaController))
  .delete(isCustomerLoggedIn, validate(DeleteCustomAlertSchemaValidationSchema), WithDatabase(DeleteCustomAlertSchemaController));

export default router;
