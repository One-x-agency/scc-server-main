import { NextFunction, Request, Response } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export default async function userMeta(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {

  const user = await db.queryOne(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.phone_number,
      u.is_root_user,
      u.created_at,
      COALESCE(json_agg(t.token) FILTER (WHERE t.token IS NOT NULL), '[]'::json) as notification_tokens
    FROM users u
    LEFT JOIN user_notification_tokens t ON t.user_id = u.id
    WHERE u.id = $1
    GROUP BY u.id
  `, [req.user.id]);

  if (!user) throw new ServerError('NOT_FOUND', 'User meta not found');

  user.permissions = req.user.permissions;

  res.status(200).json(user);
}
