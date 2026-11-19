import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  body: Joi.object({
    name: Schema.customer.alert.name().required(),
    description: Schema.customer.alert.description().allow('', null),
    message: Schema.customer.alert.message().allow('', null),
    field_name: Schema.customer.alert.fieldName().required(),
    operator: Schema.customer.alert.operator().required(),
    value: Schema.customer.alert.value().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { name, description, message, field_name, operator, value } = req.body;
  const user_id = req.user.id;

  const newAlert = await db.queryOne(`
    INSERT INTO user_custom_alert_schemas (user_id, name, description, message, field_name, operator, value)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [user_id, name, description, message, field_name, operator, value]);

  return res.status(200).json(newAlert);
};
