import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  body: Joi.object({
    number: Joi.string().max(255).required(),
    is_active: Joi.boolean().default(false),
    sim_plan_id: Schema.uuid().required(),
    imsi_number: Joi.string().max(50).allow('', null),
    activation_date: Schema.date().allow(null),
    deactivation_date: Schema.date().allow(null),
    expiry_date: Schema.date().allow(null),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { number, is_active, sim_plan_id, imsi_number, activation_date, deactivation_date, expiry_date } = req.body;

  const newSimCard = await db.queryOne(
    `
      INSERT INTO sim_cards (number, is_active, sim_plan_id, imsi_number, activation_date, deactivation_date, expiry_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [number, is_active, sim_plan_id, imsi_number, activation_date, deactivation_date, expiry_date, req.user.id],
  );

  res.status(200).json(newSimCard);
};
