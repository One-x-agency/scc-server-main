/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const customer_id = req.customer.id;

  const alerts = await db.queryAll(`
    SELECT *
    FROM customer_custom_alert_schemas
    WHERE customer_id = $1
    ORDER BY created_at DESC
  `, [customer_id]);

  return res.status(200).json(alerts);
};
