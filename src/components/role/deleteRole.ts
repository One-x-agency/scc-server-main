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

  try {
    await db.query('BEGIN', []);

    await db.query('DELETE FROM role_permissions WHERE role_id = $1', [role_id]);
    await db.query('DELETE FROM user_roles WHERE role_id = $1', [role_id]);
    await db.query('DELETE FROM roles WHERE id = $1', [role_id]);

    await db.query('COMMIT', []);

    res.status(204).end();
  } catch (error) {
    await db.query('ROLLBACK', []);
    throw error;
  }
};
