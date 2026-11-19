import { Request, Response, NextFunction } from 'express';

import z from 'zod';
import { DatabaseClient } from '@/service/database/index.js';

import ServerError from '@/utils/serverError.js';
import Token from '@/utils/jwtToken.js';
import { SendMail } from '@/service/mail/index.js';
import ForgetPasswordTemplate from '@/utils/emailTemplates/forgotPassword.js';

export const ValidationSchema = {
  body: z.object({
    email: z.email({ message: 'Invalid email address' }).toLowerCase(),
    callback_url: z.url('Invalid callback URL'),
  }),
};

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const { email, callback_url } = req.body as z.infer<typeof ValidationSchema.body>;

  const customer = await db.queryOne('SELECT id, email FROM customers WHERE email = $1', [email]);
  if (!customer) throw new ServerError('NOT_FOUND', 'Customer not found');

  const forgetPasswordToken = Token.encode({
    type: 'forget_password',
    data: {
      customer_id: customer.id,
    },
  }, { expiresIn: '10m' });

  const forgetPasswordUrl = `${callback_url}?token=${forgetPasswordToken}`;

  const html = ForgetPasswordTemplate(forgetPasswordUrl);

  await SendMail(email, 'Reset Password', html);

  res.status(204).end();
}
