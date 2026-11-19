import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  params: Joi.object({
    user_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    name: Schema.name().required(),
    email: Schema.email().required(),
    phone_number: Schema.phoneNumber().required(),
    password: Schema.password().allow('', null),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { user_id } = req.params;
  const { name, email, phone_number, password } = req.body;

  const user = await db.namedQueryOne(
    `
      UPDATE users
      SET
        name = $name,
        email = $email,
        phone_number = $phone_number,
        password_hash = COALESCE($password_hash, password_hash),
        updated_at = current_timestamp
      WHERE id = $user_id
      RETURNING *
    `,
    {
      name,
      email,
      phone_number,
      password_hash: password ? await bcrypt.hash(password, 7) : undefined,
      user_id,
    },
  );

  delete user.password_hash;

  res.status(204).end();
};
