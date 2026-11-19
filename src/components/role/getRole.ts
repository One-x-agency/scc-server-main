import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  params: Joi.object({
    role_id: Schema.uuid().required(),
  }),
};

export const Controller = async (
  req: Request,
  res: Response,
  next: NextFunction,
  db: DatabaseClient,
): Promise<void> => {
  const { role_id } = req.params as { role_id: string };

  const role = await db.queryOne(
    'SELECT * FROM roles WHERE id = $1',
    [role_id],
  );

  const permissions = await db.queryAll(
    `
    SELECT p.id, p.name, p.description, rp.access_level
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    WHERE rp.role_id = $1
    `,
    [role_id],
  );

  res.status(200).json({
    ...role,
    permissions,
  });
};
