import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import Schema from '@/config/validationSchema.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    customer_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { customer_id } = req.params;
  const customer = await db.queryOne(`
    SELECT
      c.*,
      COALESCE(
        json_agg(
          CASE
            WHEN d.id IS NOT NULL THEN
              json_build_object(
                'id', d.id,
                'name', d.name,
                'imei', d.imei,
                'created_at', d.created_at,
                'updated_at', d.updated_at
              )
            ELSE NULL
          END
        ) FILTER (WHERE d.id IS NOT NULL),
        '[]'::json
      ) as devices
    FROM customers c
    LEFT JOIN devices d ON d.customer_id = c.id
    WHERE c.id = $1
    GROUP BY c.id
  `, [customer_id]);

  if (!customer) throw new ServerError('NOT_FOUND', 'Customer not found');

  res.status(200).json(customer);
};
