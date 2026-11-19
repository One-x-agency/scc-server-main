import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import { privateRoute, hasPermission } from '@/middleware/auth/index.js';

import { ValidationSchema as ListDealerWithdrawRequestsValidationSchema, Controller as ListDealerWithdrawRequestsController } from '@/components/dealers/withdrawRequest/listDealerWithdrawRequests.js';
import { ValidationSchema as CreateDealerWithdrawRequestValidationSchema, Controller as CreateDealerWithdrawRequestController } from '@/components/dealers/withdrawRequest/createDealerWithdrawRequest.js';

import { ValidationSchema as UpdateDealerWithdrawRequestValidationSchema, Controller as UpdateDealerWithdrawRequestController } from '@/components/dealers/withdrawRequest/updateDealerWithdrawRequest.js';
import { ValidationSchema as DeleteDealerWithdrawRequestValidationSchema, Controller as DeleteDealerWithdrawRequestController } from '@/components/dealers/withdrawRequest/deleteDealerWithdrawRequest.js';

const router = express.Router();

router.route('/')
  .get(privateRoute, hasPermission('dealer', 1), validate(ListDealerWithdrawRequestsValidationSchema), WithDatabase(ListDealerWithdrawRequestsController))
  .post(privateRoute, hasPermission('dealer', 3), validate(CreateDealerWithdrawRequestValidationSchema), WithDatabase(CreateDealerWithdrawRequestController));

router.route('/:dealer_withdraw_request_id')
  .put(privateRoute, hasPermission('dealer', 2), validate(UpdateDealerWithdrawRequestValidationSchema), WithDatabase(UpdateDealerWithdrawRequestController))
  .delete(privateRoute, hasPermission('dealer', 3), validate(DeleteDealerWithdrawRequestValidationSchema), WithDatabase(DeleteDealerWithdrawRequestController));

export default router;
