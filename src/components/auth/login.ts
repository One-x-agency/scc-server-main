import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import z from 'zod';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import JWT from '@/utils/jwtToken.js';

export const ValidationSchema = {
  body: z.object({
    emailOrPhone: z.union([
      z.email(),
      z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
    ], 'Must be a valid email or 10 digit phone number'),
    password: z.string().min(5, 'Password must be at least 5 characters').max(30, 'Password must be at most 30 characters'),
  }) };

async function createUserSession(dbClient: DatabaseClient, userId: string, expiryDate: Date) {
  const session = await dbClient.queryOne(`
    INSERT INTO user_sessions (user_id, expires_at)
    VALUES ($1, $2)
    RETURNING *
  `, [userId, expiryDate.toISOString()]);
  return session;
}

// #region Controller
export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const { emailOrPhone, password } = req.body as z.infer<typeof ValidationSchema.body>;

  const user = await db.queryOne('SELECT * FROM users WHERE email = $1 OR phone_number = $1', [emailOrPhone]);
  if (!user) throw new ServerError('NOT_FOUND', 'Either email or phone number is incorrect.');

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) throw new ServerError('NOT_FOUND', 'Either email or phone number is incorrect.');

  const expiryInMilliSeconds = 1000 * 60 * 60 * 24; // 1 day
  const expiryDate = new Date(Date.now() + expiryInMilliSeconds);

  const newUserSession = await createUserSession(db, user.id, expiryDate);

  const tokenPayload = {
    type: 'admin_access_token',
    session_id: newUserSession.id,
    user_id: user.id,
  };

  const token = JWT.encode(tokenPayload, { expiresIn: `${expiryInMilliSeconds}ms` });

  const responseData = {
    token,
    expires_at: expiryDate.toISOString(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      is_root_user: user.is_root_user,
    },
  };

  res.json(responseData);
}
