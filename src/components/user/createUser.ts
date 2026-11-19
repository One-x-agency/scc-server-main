import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  body: Joi.object({
    name: Schema.name().required(),
    email: Schema.email().required(),
    phone_number: Schema.phoneNumber().required(),
    password: Schema.password().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { name, email, phone_number, password } = req.body;

  const passwordHash = await bcrypt.hash(password, 7);

  const user = await db.queryOne(
    'INSERT INTO users (name, email, phone_number, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, phone_number, passwordHash],
  );

  delete user.password_hash;

  res.status(200).json(user);
};
