/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {
  const roles = await db.queryAll('SELECT id, name, description FROM roles');
  res.status(200).json(roles);
}
