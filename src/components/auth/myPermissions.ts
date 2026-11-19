import { Request, Response } from 'express';

export default async function myPermissions(req: Request, res: Response) {
  res.status(200).json(req.user.permissions);
}
