import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import { isCustomerLoggedIn } from '@/middleware/auth/index.js';

import { Controller as CreateOrderController, ValidationSchema as CreateOrderValidationSchema } from '@/components/ecommerce/order/createOrder.js';
import { ValidationSchema as VerifyOrderValidationSchema, Controller as VerifyOrderController } from '@/components/ecommerce/order/verifyOrder.js';
import ListOrdersController from '@/components/ecommerce/order/listOrders.js';
import { ValidationSchema as GetOrderValidationSchema, Controller as GetOrderController } from '@/components/ecommerce/order/getOrder.js';

const router = express.Router();

router.route('/')
  .post(isCustomerLoggedIn, validate(CreateOrderValidationSchema), WithDatabase(CreateOrderController))
  .get(isCustomerLoggedIn, WithDatabase(ListOrdersController));

router.route('/verify')
  .post(isCustomerLoggedIn, validate(VerifyOrderValidationSchema), WithDatabase(VerifyOrderController));

router.route('/:order_id')
  .get(isCustomerLoggedIn, validate(GetOrderValidationSchema), WithDatabase(GetOrderController));
export default router;
