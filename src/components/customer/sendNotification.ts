import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import { sendCustomerNotification } from './customerNotification.service.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  params: Joi.object({
    customer_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    title: Joi.string().required(),
    body: Joi.string().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { title, body } = req.body;
  const { customer_id } = req.params;

  const results = await sendCustomerNotification(
    db,
    customer_id,
    {
      title,
      body,
      type: 'alert',
      device_id: undefined,
    },
  );

  res.status(200).json(results);
};
