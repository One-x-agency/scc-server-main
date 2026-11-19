import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    sim_card_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    number: Joi.string().max(255).required(),
    is_active: Joi.boolean().required(),
    sim_plan_id: Schema.uuid().required(),
    imsi_number: Joi.string().max(50).allow('', null),
    activation_date: Joi.date().allow('', null),
    deactivation_date: Joi.date().allow('', null),
    expiry_date: Joi.date().allow('', null),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { sim_card_id } = req.params;
  const { number, is_active, sim_plan_id, imsi_number, activation_date, deactivation_date, expiry_date } = req.body;

  const simCard = await db.namedQueryOne(
    `
      UPDATE sim_cards
      SET
        number = $number,
        is_active = $is_active,
        sim_plan_id = $sim_plan_id,
        imsi_number = $imsi_number,
        activation_date = $activation_date,
        deactivation_date = $deactivation_date,
        expiry_date = $expiry_date,
        updated_by = $updated_by,
        updated_at = current_timestamp
      WHERE id = $sim_card_id
      RETURNING *
    `,
    {
      number,
      is_active,
      sim_plan_id,
      imsi_number,
      activation_date,
      deactivation_date,
      expiry_date,
      updated_by: req.user?.id,
      sim_card_id,
    },
  );

  if (!simCard) throw new ServerError('NOT_FOUND', 'Sim card not found');

  res.status(204).end();
};
