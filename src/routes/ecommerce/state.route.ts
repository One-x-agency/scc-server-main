import express from 'express';
import { isCustomerLoggedIn } from '@/middleware/auth/index.js';
import WithDatabase from '@/utils/withDatabase.js';

import { Controller as ListStatesController } from '@/components/ecommerce/state/listStates.js';

const router = express.Router();

router.route('/')
  .get(isCustomerLoggedIn, WithDatabase(ListStatesController));

export default router;
