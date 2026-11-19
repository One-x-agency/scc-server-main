import { Request, Response, NextFunction } from 'express';
import ServerError from '@/utils/serverError.js';
import Token from '@/utils/jwtToken.js';
import Database from '@/service/database/index.js';
import AuthUser from '@/components/user/authUser.class.js';

export function validateAuthToken(token: string) : { session_id: string, user_id: string } {

  if (!token) throw new ServerError('UNAUTHORIZED', 'token is required');
  if (!token.startsWith('Bearer ')) throw new ServerError('UNAUTHORIZED', 'invalid token');

  const tokenString = token.split(' ')[1];
  if (!tokenString) throw new ServerError('UNAUTHORIZED', 'token is required');

  const payload = Token.decode(tokenString);
  if (!payload || payload.type !== 'admin_access_token') throw new ServerError('UNAUTHORIZED', 'invalid token');

  return payload as { session_id: string, user_id: string };
}

export default async function PrivateRoute(req: Request, res: Response, next: NextFunction) {

  const token = req.headers.authorization;
  const payload = validateAuthToken(token);

  const db = await Database.getConnection();

  try {

    const userSession = await db.queryOne(
      `
        SELECT
          us.id as session_id,
          u.id as user_id,
          u.is_root_user,

          COALESCE(

            array_agg(
              json_build_object(
                'code', p.code,
                'access_level', rp.access_level
              )
            ) FILTER (WHERE p.code IS NOT NULL),

            '{}'::json[]

          ) as permissions

        FROM user_sessions us
        LEFT JOIN users u ON u.id = us.user_id
        LEFT JOIN user_roles ur ON ur.user_id = u.id
        LEFT JOIN role_permissions rp ON rp.role_id = ur.role_id
        LEFT JOIN permissions p ON p.id = rp.permission_id
        WHERE us.id = $1
          AND us.expires_at > NOW()
          AND us.is_active = TRUE
        GROUP BY us.id, u.id
      `,
      [payload.session_id],
    );

    if (!userSession) throw new ServerError('UNAUTHORIZED', 'Session has been expired');

    const permissionsObject = userSession.permissions
      .sort((a: { access_level: number }, b: { access_level: number }) => a.access_level - b.access_level)
      .reduce((acc: { [key: string]: number }, permission: { code: string, access_level: number }) => {
        acc[permission.code] = permission.access_level;
        return acc;
      }, {} as { [key: string]: number });

    const user = new AuthUser({
      id: userSession.user_id,
      is_root_user: userSession.is_root_user,
      permissions: permissionsObject,
      session_id: userSession.session_id,
    });

    req.user = user;
    next();

  } finally {
    db.release();
  }
}
