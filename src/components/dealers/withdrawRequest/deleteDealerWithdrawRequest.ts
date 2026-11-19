import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    dealer_withdraw_request_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { dealer_withdraw_request_id } = req.params;

  const dealerWithdrawRequest = await db.queryOne(`
    DELETE FROM dealer_withdraw_requests WHERE id = $1 RETURNING id
  `, [dealer_withdraw_request_id]);

  if (!dealerWithdrawRequest) throw new ServerError('NOT_FOUND', 'Dealer withdraw request not found');

  res.status(204).end();
};
