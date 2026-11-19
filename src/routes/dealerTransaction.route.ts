import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import { privateRoute, hasPermission } from '@/middleware/auth/index.js';

import { ValidationSchema as CreateDealerTransactionValidationSchema, Controller as CreateDealerTransactionController } from '@/components/dealers/transaction/createDealerTransaction.js';
import { ValidationSchema as ListDealerTransactionsValidationSchema, Controller as ListDealerTransactionsController } from '@/components/dealers/transaction/listDealerTransactions.js';

const router = express.Router();

router.route('/')
  .get(privateRoute, hasPermission('dealer', 1), validate(ListDealerTransactionsValidationSchema), WithDatabase(ListDealerTransactionsController))
  .post(privateRoute, hasPermission('dealer', 3), validate(CreateDealerTransactionValidationSchema), WithDatabase(CreateDealerTransactionController));

export default router;
