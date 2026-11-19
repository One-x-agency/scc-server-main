import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    user_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { user_id } = req.params;

  const user = await db.namedQueryOne(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone_number,
        u.is_root_user,
        u.created_at,
        u.updated_at,
        array_agg(
          json_build_object(
            'id', r.id,
            'name', r.name
          )
        ) as roles
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.id = $user_id
      GROUP BY u.id
    `,
    { user_id },
  );

  if (!user) throw new ServerError('NOT_FOUND', 'User not found');

  res.status(200).json(user);
};
