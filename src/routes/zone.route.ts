import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import { privateRoute, hasPermission } from '@/middleware/auth/index.js';

import { ValidationSchema as CreateZoneValidationSchema, Controller as CreateZoneController } from '@/components/zone/createZone.js';
import { ValidationSchema as ListZonesValidationSchema, Controller as ListZonesController } from '@/components/zone/listZones.js';
import { ValidationSchema as UpdateZoneValidationSchema, Controller as UpdateZoneController } from '@/components/zone/updateZone.js';
import { ValidationSchema as DeleteZoneValidationSchema, Controller as DeleteZoneController } from '@/components/zone/deleteZone.js';

const router = express.Router();

router.route('/')
  .get(privateRoute, hasPermission('location', 1), validate(ListZonesValidationSchema), WithDatabase(ListZonesController))
  .post(privateRoute, hasPermission('location', 3), validate(CreateZoneValidationSchema), WithDatabase(CreateZoneController));

router.route('/:zone_id')
  .put(privateRoute, hasPermission('location', 2), validate(UpdateZoneValidationSchema), WithDatabase(UpdateZoneController))
  .delete(privateRoute, hasPermission('location', 3), validate(DeleteZoneValidationSchema), WithDatabase(DeleteZoneController));

export default router;
