import express from 'express';
import { isCustomerLoggedIn } from '@/middleware/auth/index.js';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import { Controller as GetProfileController } from '@/components/ecommerce/account/getProfile.js';
import { ValidationSchema as UpdateProfileValidationSchema, Controller as UpdateProfileController } from '@/components/ecommerce/account/updateProfile.js';
import { ValidationSchema as UpsertBillingAddressValidationSchema, Controller as UpsertBillingAddressController } from '@/components/ecommerce/account/upsertBillingAddress.js';
import { ValidationSchema as UpsertShippingAddressValidationSchema, Controller as UpsertShippingAddressController } from '@/components/ecommerce/account/upsertShippingAddress.js';

const router = express.Router();

router.route('/')
  .get(isCustomerLoggedIn, WithDatabase(GetProfileController))
  .put(isCustomerLoggedIn, validate(UpdateProfileValidationSchema), WithDatabase(UpdateProfileController));

router.route('/billing-address')
  .post(isCustomerLoggedIn, validate(UpsertBillingAddressValidationSchema), WithDatabase(UpsertBillingAddressController));

router.route('/shipping-address')
  .post(isCustomerLoggedIn, validate(UpsertShippingAddressValidationSchema), WithDatabase(UpsertShippingAddressController));

export default router;
