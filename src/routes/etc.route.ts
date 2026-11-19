import express from 'express';

import { Controller as GetIoElementIdsAndLabelsController } from '@/components/etc/getIoElemetIdsAndLabels.js';

const router = express.Router();

router.route('/io-element-ids-and-labels')
  .get(GetIoElementIdsAndLabelsController);

export default router;
