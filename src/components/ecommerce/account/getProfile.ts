/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {

  const customer = await db.queryOne(`--sql

    WITH customer_notification_tokens_cte AS (
      SELECT
        COALESCE(json_agg(t.token) FILTER (WHERE t.token IS NOT NULL), '[]'::json) as notification_tokens
      FROM customer_notification_tokens t
      WHERE t.customer_id = $1
    ),

    customer_billing_address AS (
      SELECT
        CASE
          WHEN cba.id IS NOT NULL THEN
            JSON_BUILD_OBJECT(
              'id', cba.id,
              'address', cba.address,
              'state_id', cba.state_id,
              'city', cba.city,
              'postal_code', cba.postal_code,
              'state_name', s.name
            )
          ELSE NULL
        END as billing_address
      FROM customer_addresses cba
      LEFT JOIN states s ON s.id = cba.state_id
      WHERE cba.customer_id = $1 AND cba.type = 'billing'
      LIMIT 1
    ),

    customer_shipping_address AS (
      SELECT
        CASE
          WHEN csa.id IS NOT NULL THEN
            JSON_BUILD_OBJECT(
              'id', csa.id,
              'address', csa.address,
              'state_id', csa.state_id,
              'city', csa.city,
              'postal_code', csa.postal_code,
              'state_name', s.name
            )
          ELSE NULL
        END as shipping_address
      FROM customer_addresses csa
      LEFT JOIN states s ON s.id = csa.state_id
      WHERE csa.customer_id = $1 AND csa.type = 'shipping'
      LIMIT 1
    )

    SELECT
      c.*,
      cba.billing_address,
      csa.shipping_address,
      t.notification_tokens
    FROM customers c
    LEFT JOIN customer_billing_address cba ON true
    LEFT JOIN customer_shipping_address csa ON true
    LEFT JOIN customer_notification_tokens_cte t ON true
    WHERE c.id = $1
  `, [req.customer.id]);

  if (!customer) throw new ServerError('NOT_FOUND', 'Customer not found');

  res.status(200).json({ ...customer, notification_tokens: customer.notification_tokens || [] });
}
