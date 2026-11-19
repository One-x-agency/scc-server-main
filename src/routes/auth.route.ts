import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import privateRoute from '@/middleware/auth/privateRoute.js';

import { ValidationSchema as LoginValidationSchema, Controller as LoginController } from '@/components/auth/login.js';
import myPermissions from '@/components/auth/myPermissions.js';
import logout from '@/components/auth/logout.js';
import userMeta from '@/components/auth/userMeta.js';

import { ValidationSchema as AddUserNotificationTokenValidationSchema, Controller as AddUserNotificationTokenController } from '@/components/user/addUserNotificationToken.js';

const router = express.Router();

router.route('/login')
  .post(validate(LoginValidationSchema), WithDatabase(LoginController));

router.route('/logout')
  .delete(privateRoute, WithDatabase(logout));

router.route('/my-permissions')
  .get(privateRoute, myPermissions);

router.route('/meta')
  .get(privateRoute, WithDatabase(userMeta));

router.route('/notification-tokens')
  .post(privateRoute, validate(AddUserNotificationTokenValidationSchema), WithDatabase(AddUserNotificationTokenController));

export default router;
