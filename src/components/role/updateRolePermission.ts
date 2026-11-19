import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Schema from '@/config/validationSchema.js';
import Database, { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    role_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    permissions: Joi.array().items(Joi.object({
      permission_id: Schema.uuid().required(),
      access_level: Joi.number().integer().min(1).max(4)
        .required(),
    })).required(),
  }),
};

export const Controller = async (
  req: Request,
  res: Response,
  next: NextFunction,
  db: DatabaseClient,
): Promise<void> => {
  const { role_id } = req.params as { role_id: string };
  const { permissions } = req.body as { permissions: { permission_id: string, access_level: number }[] };

  const appPermissions = await db.queryAll('SELECT id, access_level FROM permissions where id = ANY($1)', [permissions.map((permission) => permission.permission_id)]);

  if (appPermissions.length !== permissions.length) throw new ServerError('ERROR', 'unknown permission');

  permissions.forEach((permission) => {
    const appPermission = appPermissions.find((ap) => ap.id === permission.permission_id);
    if (!appPermission) throw new ServerError('ERROR', 'unknown permission');
    if (permission.access_level > appPermission.access_level) throw new ServerError('ERROR', 'access level is higher than the permission allowed');
  });

  try {
    await db.query('BEGIN');

    await db.query('DELETE FROM role_permissions WHERE role_id = $1', [role_id]);

    if (permissions.length > 0) {
      const pm = Database.parameter();
      const valuesQuery = permissions.map((permission) => `(${pm.i(role_id)}, ${pm.i(permission.permission_id)}, ${pm.i(permission.access_level)})`).join(', ');

      await db.query(
        `
        INSERT INTO role_permissions (role_id, permission_id, access_level)
        VALUES ${valuesQuery}
      `,
        pm.values,
      );
    }

    await db.query('COMMIT');

    res.status(204).end();
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
};
