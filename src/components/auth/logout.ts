import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';

export default async function logout(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const { session_id } = req.user;

  await db.query('DELETE FROM user_sessions WHERE id = $1', [session_id]);

  res.status(204).end();
}
