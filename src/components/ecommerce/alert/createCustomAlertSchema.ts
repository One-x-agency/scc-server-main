import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import InMemoryStorage from '@/service/store/inMemoryStorage.js';

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
  const customer_id = req.customer.id;

  const newAlert = await db.queryOne(`
    INSERT INTO customer_custom_alert_schemas (customer_id, name, description, message, field_name, operator, value)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [customer_id, name, description, message, field_name, operator, value]);

  InMemoryStorage.customers[customer_id]?.reload();

  return res.status(200).json(newAlert);
};
