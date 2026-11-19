import express from 'express';
import { validate } from '@/utils/validationHelper.js';
import WithDatabase from '@/utils/withDatabase.js';
import { privateRoute, isRootUser } from '@/middleware/auth/index.js';

import { ValidationSchema as CreateUserValidationSchema, Controller as CreateUserController } from '@/components/user/createUser.js';
import { ValidationSchema as ListUsersValidationSchema, Controller as ListUsersController } from '@/components/user/listUsers.js';
import { ValidationSchema as UpdateUserValidationSchema, Controller as UpdateUserController } from '@/components/user/updateUser.js';
import { ValidationSchema as GetUserValidationSchema, Controller as GetUserController } from '@/components/user/getUser.js';
import { ValidationSchema as UpdateUserRolesValidationSchema, Controller as UpdateUserRolesController } from '@/components/user/updateUserRoles.js';
import { ValidationSchema as AttachDevicesWithUserValidationSchema, Controller as AttachDevicesWithUserController } from '@/components/user/deviceMap/attactchDevicesWithUser.js';
import { ValidationSchema as DetachDevicesWithUserValidationSchema, Controller as DetachDevicesWithUserController } from '@/components/user/deviceMap/detachDevicesFromUser.js';

const router = express.Router();

router.route('/')
  .get(validate(ListUsersValidationSchema), privateRoute, isRootUser, WithDatabase(ListUsersController))
  .post(validate(CreateUserValidationSchema), privateRoute, isRootUser, WithDatabase(CreateUserController));

router.route('/:user_id')
  .get(validate(GetUserValidationSchema), privateRoute, WithDatabase(GetUserController))
  .put(validate(UpdateUserValidationSchema), privateRoute, isRootUser, WithDatabase(UpdateUserController));

router.route('/:user_id/roles')
  .put(validate(UpdateUserRolesValidationSchema), privateRoute, isRootUser, WithDatabase(UpdateUserRolesController));

router.route('/:user_id/devices')
  .post(validate(AttachDevicesWithUserValidationSchema), privateRoute, isRootUser, WithDatabase(AttachDevicesWithUserController))
  .delete(validate(DetachDevicesWithUserValidationSchema), privateRoute, isRootUser, WithDatabase(DetachDevicesWithUserController));

export default router;
