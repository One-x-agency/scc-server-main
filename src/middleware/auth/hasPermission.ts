import { NextFunction, Request, Response } from 'express';
import ServerError from '@/utils/serverError.js';

export default function hasPermission(permission_code: string, access_level: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user.hasPermission(permission_code, access_level)) throw new ServerError('FORBIDDEN', 'You don\'t have permission to perform this action');
    next();
  };
}
