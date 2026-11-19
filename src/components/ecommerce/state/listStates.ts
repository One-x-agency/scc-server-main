/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const states = await db.queryAll(`--sql
    SELECT
      id,
      name,
      gst_code,
      is_union_territory
    FROM states
    ORDER BY name ASC
  `);
  res.status(200).json(states);
};
