/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {

  const states = await db.queryAll(`
    SELECT *
    FROM states
    ORDER BY name ASC
  `);

  res.status(200).json(states);
}
