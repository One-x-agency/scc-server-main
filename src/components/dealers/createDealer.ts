import { Request, Response, NextFunction } from 'express';
import z from 'zod';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  body: z.object({
    name: z.string().trim().nonempty('Name is required')
      .regex(/^[a-zA-Z0-9 _-]*$/, { message: 'Name can only contain letters, numbers, spaces, and hyphens' })
      .min(3, 'Name must be at least 3 characters')
      .max(150, 'Name must be less than 150 characters'),
    pan_number: z.string().trim().length(10, 'PAN number must be 10 characters long').toUpperCase(),
    email: z.email('Invalid email address').toLowerCase(),
    phone_number: z.string().trim().regex(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' }),
    address: z.string().trim().nonempty('Address is required').min(3, 'Address must be at least 3 characters')
      .max(500, 'Address must be less than 500 characters'),
    commission_percentage: z.number().min(0).max(100, 'Commission percentage must be between 0 and 100'),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { name, pan_number, email, phone_number, address, commission_percentage } = req.body as z.infer<typeof ValidationSchema.body>;

  const promo_code = phone_number.slice(-2) + pan_number.slice(0, 5) + email.slice(0, 2) + pan_number.slice(-3);

  const dealer = await db.queryOne(`
    INSERT INTO dealers
    (name, pan_number, email, phone_number, address, promo_code, created_by, commission_percentage)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
  `, [name, pan_number, email, phone_number, address, promo_code.toUpperCase(), req.user.id, commission_percentage]);

  res.status(200).json(dealer);
};
