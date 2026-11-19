import express from 'express';
import { validate } from '@/utils/validationHelper.js';
import withDatabase from '@/utils/withDatabase.js';
import { privateRoute, isRootUser } from '@/middleware/auth/index.js';

import { ValidationSchema as CreateRoleValidationSchema, Controller as CreateRoleController } from '@/components/role/createRole.js';
import { Controller as ListRolesController } from '@/components/role/listRoles.js';

import { ValidationSchema as GetRoleValidationSchema, Controller as GetRoleController } from '@/components/role/getRole.js';
import { ValidationSchema as DeleteRoleValidationSchema, Controller as DeleteRoleController } from '@/components/role/deleteRole.js';
import { ValidationSchema as UpdateRoleValidationSchema, Controller as UpdateRoleController } from '@/components/role/updateRole.js';

import { ValidationSchema as UpdateRolePermissionValidationSchema, Controller as UpdateRolePermissionController } from '@/components/role/updateRolePermission.js';

const router = express.Router();

router.route('/')
  .get(
    privateRoute,
    isRootUser,
    withDatabase(ListRolesController),
  )
  .post(validate(CreateRoleValidationSchema), privateRoute, isRootUser, withDatabase(CreateRoleController));

router.route('/:role_id')
  .get(validate(GetRoleValidationSchema), privateRoute, isRootUser, withDatabase(GetRoleController))
  .put(validate(UpdateRoleValidationSchema), privateRoute, isRootUser, withDatabase(UpdateRoleController))
  .delete(validate(DeleteRoleValidationSchema), privateRoute, isRootUser, withDatabase(DeleteRoleController));

router.route('/:role_id/permissions')
  .put(validate(UpdateRolePermissionValidationSchema), privateRoute, isRootUser, withDatabase(UpdateRolePermissionController));

export default router;
