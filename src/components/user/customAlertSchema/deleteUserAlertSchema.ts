import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  params: Joi.object({
    alert_schema_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { alert_schema_id } = req.params;
  const user_id = req.user.id;

  // Check if alert exists and belongs to customer
  const existingAlert = await db.queryOne(
    'SELECT * FROM user_custom_alert_schemas WHERE id = $1 AND user_id = $2',
    [alert_schema_id, user_id],
  );

  if (!existingAlert) throw new ServerError('NOT_FOUND', 'Alert not found');

  await db.query(
    'DELETE FROM user_custom_alert_schemas WHERE id = $1',
    [alert_schema_id],
  );

  return res.status(204).send();
};
