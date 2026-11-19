import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import z from 'zod';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import Token from '@/utils/jwtToken.js';

export const ValidationSchema = {
  body: z.object({
    token: z.string().max(2000, 'Token must be less than 2000 characters'),
    new_password: z.string().trim().nonempty('Password is required')
      .min(5, 'Password must be at least 5 characters')
      .max(30, 'Password must be less than 30 characters'),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { token, new_password } = req.body as z.infer<typeof ValidationSchema.body>;

  const tokenPayload = Token.decode(token);
  if (!tokenPayload || tokenPayload.type !== 'forget_password') throw new ServerError('ERROR', 'Token is not valid');

  const customer = await db.queryOne('SELECT id FROM customers WHERE id = $1', [tokenPayload.data.customer_id]);
  if (!customer) throw new ServerError('ERROR', 'Customer not found');

  const passwordHash = await bcrypt.hash(new_password, 7);

  await db.queryOne('UPDATE customers SET password_hash = $1 WHERE id = $2', [passwordHash, customer.id]);

  res.status(204).end();
};
