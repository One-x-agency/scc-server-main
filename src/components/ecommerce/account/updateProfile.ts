import { NextFunction, Request, Response } from 'express';
import z from 'zod';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  body: z.object({
    name: z.string().trim().nonempty('Name is required')
      .regex(/^[a-zA-Z0-9 _-]*$/, { message: 'Name can only contain letters, numbers, spaces, and hyphens' })
      .min(3, 'Name must be at least 3 characters')
      .max(150, 'Name must be less than 150 characters'),
    phone_number: z.string().trim().nonempty('Phone number is required').regex(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' }),
    organization_name: z.string().trim().nonempty('Organization name is required')
      .regex(/^[a-zA-Z0-9 _-]*$/, { message: 'Organization name can only contain letters, numbers, spaces, and hyphens' })
      .min(3, 'Organization name must be at least 3 characters')
      .max(150, 'Organization name must be less than 150 characters')
      .nullish(),
    gst_number: z.string().trim().min(15).max(15)
      .nullish(),
    pan_number: z.string().trim().min(10).max(10)
      .nullish(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { name, phone_number, organization_name, gst_number, pan_number } = req.body as z.infer<typeof ValidationSchema.body>;

  const newCustomer = await db.namedQueryOne(`
    UPDATE customers
    SET
      name = $name,
      phone_number = $phone_number,
      organization_name = $organization_name,
      gst_number = $gst_number,
      pan_number = $pan_number
    WHERE id = $id
    RETURNING *
  `, {
    name,
    phone_number,
    organization_name,
    gst_number,
    pan_number,
    id: req.customer.id,
  });

  if (!newCustomer) throw new ServerError('NOT_FOUND', 'Customer not found');

  res.status(204).end();
};
