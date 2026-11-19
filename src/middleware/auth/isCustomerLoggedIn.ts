import { Request, Response, NextFunction } from 'express';
import ServerError from '@/utils/serverError.js';
import Token from '@/utils/jwtToken.js';

export function validateCustomerToken(token: string) : { customer_id: string } {

  if (!token) throw new ServerError('UNAUTHORIZED', 'token is required');
  if (!token.startsWith('Bearer ')) throw new ServerError('UNAUTHORIZED', 'invalid token');

  const tokenString = token.split(' ')[1];
  if (!tokenString) throw new ServerError('UNAUTHORIZED', 'token is required');

  const payload = Token.decode(tokenString);
  if (!payload || payload.type !== 'customer_access_token') throw new ServerError('UNAUTHORIZED', 'invalid token');

  return payload as { customer_id: string };
}

export default async function isCustomerLoggedIn(req: Request, res: Response, next: NextFunction) {

  const token = req.headers.authorization;
  const payload = validateCustomerToken(token);

  req.customer = { id: payload.customer_id };

  next();
}
