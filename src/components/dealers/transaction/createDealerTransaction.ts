import { NextFunction, Request, Response } from 'express';

import z from 'zod';
import { DatabaseClient } from '@/service/database/index.js';

import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  body: z.object({
    dealer_id: z.uuid({ version: 'v4', message: 'Invalid dealer ID' }),
    amount: z.number().positive('Amount must be greater than 0').transform((value) => value * 100),
    remark: z.string().trim().max(500, 'Remark must be less than 500 characters'),
    dealer_withdraw_request_id: z.uuid({ version: 'v4', message: 'Invalid dealer withdraw request ID' }).nullish(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { dealer_id, amount, remark, dealer_withdraw_request_id } = req.body as z.infer<typeof ValidationSchema.body>;

  try {
    await db.query('BEGIN');

    const dealer = await db.queryOne('SELECT id, balance FROM dealers WHERE id = $1', [dealer_id]);
    if (!dealer) throw new ServerError('NOT_FOUND', 'Dealer not found');

    if (dealer.balance < amount) throw new ServerError('ERROR', 'Dealer balance is not enough.');

    const dealerTransaction = await db.queryOne(`
      INSERT INTO dealer_transactions (dealer_id, amount, type, remark, dealer_withdraw_request_id, created_by)
      VALUES ($1, $2, 'out', $3, $4, $5)
      RETURNING *
    `, [dealer_id, amount, remark, dealer_withdraw_request_id, req.user.id]);

    await db.query('UPDATE dealers SET balance = balance - $1 WHERE id = $2', [amount, dealer_id]);
    if (dealer_withdraw_request_id) await db.query('UPDATE dealer_withdraw_requests SET status = $1 WHERE id = $2', ['completed', dealer_withdraw_request_id]);

    await db.query('COMMIT');

    res.status(200).json(dealerTransaction);
  } catch (error) {
    db.query('ROLLBACK');
    throw error;
  }
};
