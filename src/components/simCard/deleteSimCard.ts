import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  params: Joi.object({
    sim_card_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { sim_card_id } = req.params;

  const existingSimCard = await db.queryOne(
    'SELECT * FROM sim_cards WHERE id = $1',
    [sim_card_id],
  );

  if (!existingSimCard) {
    throw new ServerError('NOT_FOUND', 'Sim card not found');
  }

  await db.query(
    'DELETE FROM sim_cards WHERE id = $1',
    [sim_card_id],
  );

  res.status(204).end();
};
