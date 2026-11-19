import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import z from 'zod';
import JWT from '@/utils/jwtToken.js';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  body: z.object({
    token: z.string().max(2000, 'Token must be less than 2000 characters'),
    otp: z.string().trim().nonempty('OTP is required').regex(/^[0-9]{6}$/, 'OTP must be 6 digits'),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { token, otp } = req.body as z.infer<typeof ValidationSchema.body>;

  const decoded = JWT.decode(token);

  if (!decoded) throw new ServerError('ERROR', 'Token is not valid');
  if (decoded.type !== 'customer_registration_token') throw new ServerError('ERROR', 'Invalid token type');

  const tokenData = await db.queryOne('SELECT * FROM tokens WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP', [token]);

  if (!tokenData) throw new ServerError('ERROR', 'Token is expired');

  if (tokenData.value !== otp) throw new ServerError('ERROR', 'Invalid OTP');

  const passwordHash = await bcrypt.hash(decoded.password, 7);

  const newCustomer = await db.namedQueryOne(`
    INSERT INTO customers
      (name, phone_number, email, password_hash, is_email_verified)
    VALUES
      (
        $name,
        $phone_number,
        $email,
        $password_hash,
        $is_email_verified
      ) RETURNING *
  `, {
    name: decoded.name,
    phone_number: decoded.phone_number,
    email: decoded.email,
    password_hash: passwordHash,
    is_email_verified: true,
  });

  delete newCustomer.password_hash;

  const expiryInMilliSeconds = {
    web: 1000 * 60 * 60 * 24, // 1 day
    app: 1000 * 60 * 60 * 24 * 30, // 30 days
  }.web;

  const expiryDate = new Date(Date.now() + expiryInMilliSeconds);

  const tokenPayload = {
    type: 'customer_access_token',
    customer_id: newCustomer.id,
  };

  const accessToken = JWT.encode(tokenPayload, { expiresIn: `${expiryInMilliSeconds}ms` });

  res.status(200).json({
    token: accessToken,
    expires_at: expiryDate.toISOString(),
    customer: {
      id: newCustomer.id,
      name: newCustomer.name,
      email: newCustomer.email,
      phone_number: newCustomer.phone_number,
    },
  });
};
