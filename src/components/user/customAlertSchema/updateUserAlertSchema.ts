import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    alert_schema_id: Schema.uuid().required(),
  }),
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
  const { alert_schema_id } = req.params;
  const { name, description, message, field_name, operator, value } = req.body;
  const user_id = req.user.id;

  // Check if alert exists and belongs to customer
  const existingAlert = await db.queryOne(
    'SELECT * FROM user_custom_alert_schemas WHERE id = $1 AND user_id = $2',
    [alert_schema_id, user_id],
  );

  if (!existingAlert) throw new ServerError('NOT_FOUND', 'Alert not found');

  await db.query(`
    UPDATE user_custom_alert_schemas
    SET
      name = $1,
      description = $2,
      message = $3,
      field_name = $4,
      operator = $5,
      value = $6
    WHERE id = $7
  `, [name, description, message, field_name, operator, value, alert_schema_id]);

  return res.status(204).send();
};
