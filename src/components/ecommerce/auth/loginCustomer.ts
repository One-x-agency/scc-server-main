import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import z from 'zod';

import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import JWT from '@/utils/jwtToken.js';

// #region ValidationSchema
export const ValidationSchema = {
  body: z.object({
    email: z.email({ message: 'Invalid email address' }).toLowerCase(),
    password: z.string().trim().nonempty('Password is required')
      .max(30, 'Password must be less than 30 characters'),
    source: z.enum(['web', 'app']).default('web'),
  }),
};

// #region Controller
export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const { email, password, source } = req.body as z.infer<typeof ValidationSchema.body>;

  const customer = await db.queryOne('SELECT * FROM customers WHERE email = $1', [email]);
  if (!customer) throw new ServerError('NOT_FOUND', 'Either email or password is incorrect.');
  if (!customer.is_email_verified) throw new ServerError('NOT_FOUND', 'Email is not verified.');

  const isPasswordValid = await bcrypt.compare(password, customer.password_hash);
  if (!isPasswordValid) throw new ServerError('NOT_FOUND', 'Entered email or password is incorrect.');

  const expiryInMilliSeconds = {
    web: 1000 * 60 * 60 * 24, // 1 day
    app: 1000 * 60 * 60 * 24 * 30, // 30 days
  }[source];

  const expiryDate = new Date(Date.now() + expiryInMilliSeconds);

  const tokenPayload = {
    type: 'customer_access_token',
    customer_id: customer.id,
  };

  const token = JWT.encode(tokenPayload, { expiresIn: `${expiryInMilliSeconds}ms` });

  const responseData = {
    token,
    expires_at: expiryDate.toISOString(),
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone_number: customer.phone_number,
    },
  };

  res.json(responseData);
}
