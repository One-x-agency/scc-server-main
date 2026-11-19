import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { privateRoute, hasPermission } from '@/middleware/auth/index.js';

import { Controller as ListStatesController } from '@/components/state/listStates.js';

const router = express.Router();

router.route('/')
  .get(privateRoute, hasPermission('location', 1), WithDatabase(ListStatesController));

export default router;
