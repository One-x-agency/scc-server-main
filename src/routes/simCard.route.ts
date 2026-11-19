import express from 'express';
import { validate } from '@/utils/validationHelper.js';
import WithDatabase from '@/utils/withDatabase.js';
import { privateRoute, hasPermission } from '@/middleware/auth/index.js';

import { ValidationSchema as CreateSimCardValidationSchema, Controller as CreateSimCardController } from '@/components/simCard/createSimCard.js';
import { ValidationSchema as ListSimCardsValidationSchema, Controller as ListSimCardsController } from '@/components/simCard/listSimCards.js';
import { ValidationSchema as UpdateSimCardValidationSchema, Controller as UpdateSimCardController } from '@/components/simCard/updateSimCard.js';
import { ValidationSchema as GetSimCardValidationSchema, Controller as GetSimCardController } from '@/components/simCard/getSimCard.js';
import { ValidationSchema as DeleteSimCardValidationSchema, Controller as DeleteSimCardController } from '@/components/simCard/deleteSimCard.js';

const router = express.Router();

router.route('/')
  .get(validate(ListSimCardsValidationSchema), privateRoute, hasPermission('sim_card.list', 1), WithDatabase(ListSimCardsController))
  .post(validate(CreateSimCardValidationSchema), privateRoute, hasPermission('sim_card.create', 3), WithDatabase(CreateSimCardController));

router.route('/:sim_card_id')
  .get(validate(GetSimCardValidationSchema), privateRoute, hasPermission('sim_card', 1), WithDatabase(GetSimCardController))
  .put(validate(UpdateSimCardValidationSchema), privateRoute, hasPermission('sim_card', 2), WithDatabase(UpdateSimCardController))
  .delete(validate(DeleteSimCardValidationSchema), privateRoute, hasPermission('sim_card', 3), WithDatabase(DeleteSimCardController));

export default router;
