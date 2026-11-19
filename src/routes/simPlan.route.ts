import express from 'express';
import { validate } from '@/utils/validationHelper.js';
import WithDatabase from '@/utils/withDatabase.js';
import { privateRoute, isRootUser } from '@/middleware/auth/index.js';

import { ValidationSchema as CreateSimPlanValidationSchema, Controller as CreateSimPlanController } from '@/components/simPlan/createSimPlan.js';
import { ValidationSchema as ListSimPlansValidationSchema, Controller as ListSimPlansController } from '@/components/simPlan/listSimPlans.js';
import { ValidationSchema as UpdateSimPlanValidationSchema, Controller as UpdateSimPlanController } from '@/components/simPlan/updateSimPlan.js';
import { ValidationSchema as GetSimPlanValidationSchema, Controller as GetSimPlanController } from '@/components/simPlan/getSimPlan.js';
import { ValidationSchema as DeleteSimPlanValidationSchema, Controller as DeleteSimPlanController } from '@/components/simPlan/deleteSimPlan.js';

const router = express.Router();

router.route('/')
  .get(validate(ListSimPlansValidationSchema), privateRoute, isRootUser, WithDatabase(ListSimPlansController))
  .post(validate(CreateSimPlanValidationSchema), privateRoute, isRootUser, WithDatabase(CreateSimPlanController));

router.route('/:sim_plan_id')
  .get(validate(GetSimPlanValidationSchema), privateRoute, isRootUser, WithDatabase(GetSimPlanController))
  .put(validate(UpdateSimPlanValidationSchema), privateRoute, isRootUser, WithDatabase(UpdateSimPlanController))
  .delete(validate(DeleteSimPlanValidationSchema), privateRoute, isRootUser, WithDatabase(DeleteSimPlanController));

export default router;
