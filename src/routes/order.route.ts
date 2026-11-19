import express from 'express';
import { validate } from '@/utils/validationHelper.js';
import WithDatabase from '@/utils/withDatabase.js';
import { privateRoute, hasPermission } from '@/middleware/auth/index.js';
import { ValidationSchema as ListOrdersValidationSchema, Controller as ListOrdersController } from '@/components/order/listOrders.js';
import { ValidationSchema as GetOrderValidationSchema, Controller as GetOrderController } from '@/components/order/getOrder.js';
import { ValidationSchema as UpdateOrderStatusValidationSchema, Controller as UpdateOrderStatusController } from '@/components/order/updateOrderStatus.js';
import { ValidationSchema as CompleteOrderValidationSchema, Controller as CompleteOrderController } from '@/components/order/completeOrder.js';
import { ValidationSchema as VerifyOrderCompletionValidationSchema, Controller as VerifyOrderCompletionController } from '@/components/order/verifyOrderCompletion.js';

const orderRoute = express.Router();

orderRoute.route('/')
  .get(privateRoute, hasPermission('order', 1), validate(ListOrdersValidationSchema), WithDatabase(ListOrdersController));

orderRoute.route('/:order_id')
  .get(privateRoute, hasPermission('order', 1), validate(GetOrderValidationSchema), WithDatabase(GetOrderController))
  .put(privateRoute, hasPermission('order', 2), validate(UpdateOrderStatusValidationSchema), WithDatabase(UpdateOrderStatusController));

orderRoute.route('/:order_id/complete')
  .post(privateRoute, hasPermission('order', 2), validate(CompleteOrderValidationSchema), WithDatabase(CompleteOrderController));

orderRoute.route('/verify-completion')
  .post(privateRoute, hasPermission('order', 2), validate(VerifyOrderCompletionValidationSchema), WithDatabase(VerifyOrderCompletionController));

export default orderRoute;
