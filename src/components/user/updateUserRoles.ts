import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import Database, { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  params: Joi.object({
    user_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    role_ids: Joi.array().items(Schema.uuid()).required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { user_id } = req.params;
  const { role_ids } = req.body as { role_ids: string[] };

  try {
    await db.query('BEGIN');

    await db.query('DELETE FROM user_roles WHERE user_id = $1', [user_id]);

    const pm = Database.parameter();

    if (role_ids.length > 0) {
      const valueQuery = role_ids.map((role_id) => `(${pm.i(user_id, 'user_id')}, ${pm.i(role_id)})`).join(',');
      await db.query(`INSERT INTO user_roles (user_id, role_id) VALUES ${valueQuery}`, pm.values);
    }

    await db.query('COMMIT');

    res.status(204).end();
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }

};
