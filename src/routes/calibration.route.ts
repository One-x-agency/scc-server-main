import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import { privateRoute, hasPermission } from '@/middleware/auth/index.js';

import { ValidationSchema as ListCalibrationsValidationSchema, Controller as ListCalibrationsController } from '@/components/calibration/listCalibrations.js';
import { ValidationSchema as DeleteCalibrationValidationSchema, Controller as DeleteCalibrationController } from '@/components/calibration/deleteCalibration.js';
import { ValidationSchema as CreateCalibrationValidationSchema, Controller as CreateCalibrationController } from '@/components/calibration/createCalibration.js';
import { ValidationSchema as UpdateCalibrationValidationSchema, Controller as UpdateCalibrationController } from '@/components/calibration/updateCalibration.js';
import { ValidationSchema as GetCalibrationValidationSchema, Controller as GetCalibrationController } from '@/components/calibration/getCalibration.js';

const router = express.Router();

router.route('/')
  .get(validate(ListCalibrationsValidationSchema), privateRoute, hasPermission('calibration', 1), WithDatabase(ListCalibrationsController))
  .post(validate(CreateCalibrationValidationSchema), privateRoute, hasPermission('calibration', 3), WithDatabase(CreateCalibrationController));

router.route('/:calibration_id')
  .get(validate(GetCalibrationValidationSchema), privateRoute, hasPermission('calibration', 1), WithDatabase(GetCalibrationController))
  .put(validate(UpdateCalibrationValidationSchema), privateRoute, hasPermission('calibration', 3), WithDatabase(UpdateCalibrationController))
  .delete(validate(DeleteCalibrationValidationSchema), privateRoute, hasPermission('calibration', 3), WithDatabase(DeleteCalibrationController));

export default router;
