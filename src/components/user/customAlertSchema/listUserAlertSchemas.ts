/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const user_id = req.user.id;

  const alerts = await db.queryAll(`
    SELECT *
    FROM user_custom_alert_schemas
    WHERE user_id = $1
    ORDER BY created_at DESC
  `, [user_id]);

  return res.status(200).json(alerts);
};
