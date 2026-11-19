import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  body: Joi.object({
    dealer_id: Schema.uuid().required(),
    amount: Joi.number().greater(0).required(), // in Paisa
    remark: Schema.remark(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { dealer_id, amount, remark } = req.body;

  try {

    await db.query('BEGIN');

    const dealer = await db.queryOne('SELECT id, balance FROM dealers WHERE id = $1', [dealer_id]);

    if (!dealer) throw new ServerError('NOT_FOUND', 'Dealer not found');

    if (dealer.balance < amount) throw new ServerError('ERROR', 'Dealer balance is not enough');

    const dealerWithdrawRequest = await db.queryOne(`
        INSERT INTO dealer_withdraw_requests
          (dealer_id, amount, created_by, remark)
        VALUES
          ($1, $2, $3, $4)
        RETURNING *
      `, [dealer_id, amount * 100, req.user.id, remark]);

    await db.query('COMMIT');

    res.status(200).json(dealerWithdrawRequest);

  } catch (error) {
    db.query('ROLLBACK');
    throw error;
  }

};
