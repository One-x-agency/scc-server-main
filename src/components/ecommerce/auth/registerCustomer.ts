import { Request, Response, NextFunction } from 'express';

import z from 'zod';
import JWT from '@/utils/jwtToken.js';

import { DatabaseClient } from '@/service/database/index.js';
import emailVerifyOtp from '@/utils/emailTemplates/emailVerifyOtp.js';
import { SendMail } from '@/service/mail/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  body: z.object({
    name: z
      .string()
      .trim()
      .nonempty('Name is required')
      .min(5, 'Name must be at least 5 characters')
      .max(150, 'Name must be less than 150 characters')
      .regex(/^[a-zA-Z0-9 _-]*$/, {
        message: 'Name can only contain letters, numbers, spaces, and hyphens',
      }),
    phone_number: z
      .string()
      .trim()
      .nonempty('Phone number is required')
      .regex(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' }),
    email: z.email({ message: 'Invalid email address' }).toLowerCase(),
    password: z
      .string()
      .trim()
      .nonempty('Password is required')
      .min(5, 'Password must be at least 5 characters')
      .max(30, 'Password must be less than 30 characters'),
  }),
};

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { name, phone_number, email, password } = req.body as z.infer<typeof ValidationSchema.body>;

  const existingCustomer = await db.queryOne('SELECT id, name, email, phone_number FROM customers WHERE email = $1 OR phone_number = $2', [email, phone_number]);
  if (existingCustomer) {
    if (existingCustomer.email === email) throw new ServerError('ERROR', 'Customer with this email already exists');
    if (existingCustomer.phone_number === phone_number) throw new ServerError('ERROR', 'Customer with this phone number already exists');
  }

  const token = JWT.encode({
    type: 'customer_registration_token',
    name,
    phone_number,
    email,
    password,
  }, { expiresIn: '10m' });

  const otp = generateOtp();

  await db.queryOne(`
    INSERT INTO tokens (token, value, expires_at)
    VALUES ($1, $2, $3)
  `, [token, otp, new Date(Date.now() + 10 * 60 * 1000)]);

  SendMail(email, 'Email Verification', emailVerifyOtp(otp.toString()));

  res.status(200).json({ token });
};
