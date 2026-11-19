import express from 'express';
import { validate } from '@/utils/validationHelper.js';
import WithDatabase from '@/utils/withDatabase.js';
import { isCustomerLoggedIn } from '@/middleware/auth/index.js';

import { ValidationSchema as AddToCartValidationSchema, Controller as AddToCartController } from '@/components/ecommerce/cart/upsertCartItem.js';
import { ValidationSchema as RemoveFromCartValidationSchema, Controller as RemoveFromCartController } from '@/components/ecommerce/cart/deleteCartItem.js';
import ListCartItemsController from '@/components/ecommerce/cart/listCartItems.js';

const cartRoute = express.Router();

cartRoute.route('/')
  .get(isCustomerLoggedIn, WithDatabase(ListCartItemsController))
  .post(validate(AddToCartValidationSchema), isCustomerLoggedIn, WithDatabase(AddToCartController))
  .delete(validate(RemoveFromCartValidationSchema), isCustomerLoggedIn, WithDatabase(RemoveFromCartController));

export default cartRoute;
