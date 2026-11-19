import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    dealer_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    name: Schema.name().required(),
    pan_number: Schema.panNumber().required(),
    email: Schema.email().required(),
    phone_number: Schema.phoneNumber().required(),
    address: Schema.address().required(),
    commission_percentage: Joi.number().min(0).max(100).required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { dealer_id } = req.params;
  const { name, pan_number, email, phone_number, address, commission_percentage } = req.body;

  const promo_code = phone_number.slice(-2) + pan_number.slice(0, 5) + email.slice(0, 2) + pan_number.slice(-3);

  const dealer = await db.namedQueryOne(`
    UPDATE dealers
    SET name = $name, pan_number = $pan_number, email = $email, phone_number = $phone_number, address = $address, promo_code = $promo_code, commission_percentage = $commission_percentage
    WHERE id = $dealer_id
    RETURNING *
  `, { name, pan_number, email, phone_number, address, promo_code: promo_code.toUpperCase(), dealer_id, commission_percentage });

  if (!dealer) throw new ServerError('NOT_FOUND', 'Dealer not found');

  res.status(204).end();
};
