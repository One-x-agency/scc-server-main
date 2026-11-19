import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';

import { ValidationSchema as RegisterCustomerValidationSchema, Controller as RegisterCustomerController } from '@/components/ecommerce/auth/registerCustomer.js';
import { ValidationSchema as LoginCustomerValidationSchema, Controller as LoginCustomerController } from '@/components/ecommerce/auth/loginCustomer.js';
import { ValidationSchema as VerifyCustomerValidationSchema, Controller as VerifyCustomerController } from '@/components/ecommerce/auth/verifyCustomer.js';
import { ValidationSchema as ForgetPasswordValidationSchema, Controller as ForgetPasswordController } from '@/components/ecommerce/auth/forgetPassword.js';
import { ValidationSchema as ResetPasswordValidationSchema, Controller as ResetPasswordController } from '@/components/ecommerce/auth/resetPassword.js';

const router = express.Router();

router.route('/register')
  .post(validate(RegisterCustomerValidationSchema), WithDatabase(RegisterCustomerController));

router.route('/login')
  .post(validate(LoginCustomerValidationSchema), WithDatabase(LoginCustomerController));

router.route('/verify-account')
  .post(validate(VerifyCustomerValidationSchema), WithDatabase(VerifyCustomerController));

router.route('/forget-password')
  .post(validate(ForgetPasswordValidationSchema), WithDatabase(ForgetPasswordController));

router.route('/reset-password')
  .post(validate(ResetPasswordValidationSchema), WithDatabase(ResetPasswordController));

export default router;
