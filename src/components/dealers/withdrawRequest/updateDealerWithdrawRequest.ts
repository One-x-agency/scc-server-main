import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    dealer_withdraw_request_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    status: Schema.dealer.withdrawRequest.status(),
    remark: Schema.remark(),
  }).min(1),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { dealer_withdraw_request_id } = req.params;
  const { status, remark } = req.body;

  const setClause = [];
  if (status) setClause.push('status = $status');
  if (remark) setClause.push('remark = $remark');

  const dealerWithdrawRequest = await db.namedQueryOne(`
        UPDATE dealer_withdraw_requests
        SET
          ${setClause.join(', ')}
        WHERE id = $id
        RETURNING id
      `, {
    status,
    remark,
    id: dealer_withdraw_request_id,
  });

  if (!dealerWithdrawRequest) throw new ServerError('NOT_FOUND', 'Dealer withdraw request not found');

  res.status(204).end();

};
