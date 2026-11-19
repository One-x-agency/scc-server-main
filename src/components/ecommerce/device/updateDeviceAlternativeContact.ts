import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    device_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    alternative_contacts: Schema.device.alternative_contacts().min(3),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { device_id } = req.params;
  const { alternative_contacts } = req.body;

  const existingDevice = await db.queryOne(`
      select id from devices where id = $1 and customer_id = $2
    `, [device_id, req.customer.id]);

  if (!existingDevice) throw new ServerError('NOT_FOUND', 'Device not found');

  await db.query(`
    update devices set alternative_contacts = $1::jsonb where id = $2
  `, [JSON.stringify(alternative_contacts), device_id]);

  return res.status(204).end();
};
