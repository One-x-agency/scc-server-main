import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  params: Joi.object({
    dealer_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { dealer_id } = req.params;

  const deletedDealer = await db.queryOne(
    'DELETE FROM dealers WHERE id = $1 RETURNING *',
    [dealer_id],
  );

  if (!deletedDealer) throw new ServerError('NOT_FOUND', 'Dealer not found');

  return res.status(204).send();
};
