import { NextFunction, Request, Response } from 'express';

import ServerError from '@/utils/serverError.js';

export default function isRootUser(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.is_root_user) throw new ServerError('FORBIDDEN', 'you are not authorized to access this resource');
  next();
}
