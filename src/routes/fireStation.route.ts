import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import { privateRoute, hasPermission } from '@/middleware/auth/index.js';

import { ValidationSchema as CreateFireStationValidationSchema, Controller as CreateFireStationController } from '@/components/fireStation/createFireStation.js';
import { ValidationSchema as ListFireStationsValidationSchema, Controller as ListFireStationsController } from '@/components/fireStation/listFireStation.js';
import { ValidationSchema as UpdateFireStationValidationSchema, Controller as UpdateFireStationController } from '@/components/fireStation/updateFireStation.js';
import { ValidationSchema as DeleteFireStationValidationSchema, Controller as DeleteFireStationController } from '@/components/fireStation/deleteFireStation.js';

const router = express.Router();

router.route('/')
  .get(privateRoute, hasPermission('location', 1), validate(ListFireStationsValidationSchema), WithDatabase(ListFireStationsController))
  .post(privateRoute, hasPermission('location', 3), validate(CreateFireStationValidationSchema), WithDatabase(CreateFireStationController));

router.route('/:fire_station_id')
  .put(privateRoute, hasPermission('location', 2), validate(UpdateFireStationValidationSchema), WithDatabase(UpdateFireStationController))
  .delete(privateRoute, hasPermission('location', 3), validate(DeleteFireStationValidationSchema), WithDatabase(DeleteFireStationController));

export default router;
