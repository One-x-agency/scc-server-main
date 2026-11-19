import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    dealer_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { dealer_id } = req.params;

  const dealer = await db.queryOne(`
    SELECT
      *,
      (balance / 100)::numeric as balance
    FROM dealers WHERE id = $1
  `, [dealer_id]);

  if (!dealer) throw new ServerError('NOT_FOUND', 'Dealer not found');

  res.status(200).json(dealer);
};
