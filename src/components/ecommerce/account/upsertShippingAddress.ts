import { Request, Response, NextFunction } from 'express';
import z from 'zod';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  body: z.object({
    address: z.string().trim()
      .min(5, 'Address must be at least 5 characters')
      .max(2000, 'Address must be less than 2000 characters'),
    state_id: z.uuid({ version: 'v4', message: 'Invalid state ID' }),
    city: z.string().trim().nonempty('City is required')
      .min(3, 'City must be at least 3 characters')
      .max(150, 'City must be less than 150 characters'),
    postal_code: z.string().trim().nonempty('Postal code is required')
      .length(6, 'Postal code must be 6 digits'),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {

  const { address, state_id, city, postal_code } = req.body as z.infer<typeof ValidationSchema.body>;

  const existingAddress = await db.queryOne(`
    SELECT id FROM customer_addresses WHERE customer_id = $1 AND type = 'shipping'
  `, [req.customer.id]);

  let result;
  if (existingAddress) {
    await db.queryOne(`
      UPDATE customer_addresses
      SET
        address = $1,
        state_id = $2,
        city = $3,
        postal_code = $4,
        updated_at = current_timestamp
      WHERE id = $5
      RETURNING *
    `, [address, state_id, city, postal_code, existingAddress.id]);
  } else {
    await db.queryOne(`
      INSERT INTO customer_addresses (address, state_id, city, postal_code, type, customer_id)
      VALUES ($1, $2, $3, $4, 'shipping', $5)
      RETURNING *
    `, [address, state_id, city, postal_code, req.customer.id]);
  }

  res.status(200).json(result);

};
