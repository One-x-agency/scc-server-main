import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import Schema from '@/config/validationSchema.js';
import InMemoryStorage from '@/service/store/inMemoryStorage.js';

export const ValidationSchema = {
  params: Joi.object({
    custom_alert_schema_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { custom_alert_schema_id } = req.params;
  const customer_id = req.customer.id;

  // Check if alert exists and belongs to customer
  const existingAlert = await db.queryOne(
    'SELECT * FROM customer_custom_alert_schemas WHERE id = $1 AND customer_id = $2',
    [custom_alert_schema_id, customer_id],
  );

  if (!existingAlert) throw new ServerError('NOT_FOUND', 'Alert not found');

  await db.query(
    'DELETE FROM customer_custom_alert_schemas WHERE id = $1',
    [custom_alert_schema_id],
  );

  InMemoryStorage.customers[customer_id]?.reload();

  return res.status(204).send();
};
