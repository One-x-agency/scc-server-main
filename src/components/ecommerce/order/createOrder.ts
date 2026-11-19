import { NextFunction, Request, Response } from 'express';
import z from 'zod';
import { DatabaseClient } from '@/service/database/index.js';
import RazorpayInstance from '@/service/payment/razorpay/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  body: z.object({
    promo_code: z.string().trim().nullish(),
    name: z.string().trim().nonempty('Name is required')
      .regex(/^[a-zA-Z0-9 _-]*$/, { message: 'Name can only contain letters, numbers, spaces, and hyphens' })
      .min(5, 'Name must be at least 3 characters')
      .max(150, 'Name must be less than 150 characters'),
    phone_number: z.string().trim().nonempty('Phone number is required').length(10, 'Phone number must be 10 digits'),
    organization_name: z.union([
      z.string().trim().nonempty('Organization name is required')
        .regex(/^[a-zA-Z0-9 _-]*$/, { message: 'Organization name can only contain letters, numbers, spaces, and hyphens' })
        .min(3, 'Organization name must be at least 3 characters')
        .max(150, 'Organization name must be less than 150 characters')
        .nullable(),
      z.literal(''),
    ]),

    gst_number: z.union([
      z.string().trim().nonempty('GST number is required').toUpperCase()
        .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, { message: 'Invalid GST number' })
        .nullable(),
      z.literal(''),
    ]),
    pan_number: z.union([
      z.string().trim().nonempty('PAN number is required').toUpperCase()
        .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN number' })
        .nullable(),
      z.literal(''),
    ]),
    shipping_address: z.string().trim().min(5, 'Address must be at least 5 characters')
      .max(1000, 'Address must be less than 1000 characters'),
    shipping_state_id: z.uuid({ version: 'v4', message: 'Invalid state ID' }),
    shipping_city: z.string().trim().nonempty('City is required')
      .min(3, 'City must be at least 3 characters')
      .max(150, 'City must be less than 150 characters'),
    shipping_postal_code: z.string().trim().nonempty('Postal code is required')
      .length(6, 'Postal code must be 6 digits'),

    billing_address: z.string().trim().min(5, 'Address must be at least 5 characters')
      .max(1000, 'Address must be less than 1000 characters'),
    billing_state_id: z.uuid({ version: 'v4', message: 'Invalid state ID' }),
    billing_city: z.string().trim().nonempty('City is required')
      .min(3, 'City must be at least 3 characters')
      .max(150, 'City must be less than 150 characters'),
    billing_postal_code: z.string().trim().nonempty('Postal code is required')
      .length(6, 'Postal code must be 6 digits'),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {

  const customer_id = req.customer.id;
  const { promo_code, name, phone_number, organization_name, gst_number, pan_number, shipping_address, shipping_state_id, shipping_city, shipping_postal_code, billing_address, billing_state_id, billing_city, billing_postal_code } = req.body as z.infer<typeof ValidationSchema.body>;

  let dealer_id = null;

  if (promo_code) {
    const dealer = await db.queryOne('SELECT * FROM dealers WHERE promo_code = $1', [promo_code.toUpperCase()]);
    if (!dealer) throw new ServerError('NOT_FOUND', 'Promo code is invalid');
    dealer_id = dealer.id;
  }

  try {
    await db.query('BEGIN');

    await db.namedQueryOne(`
      UPDATE customers SET
        name = $name,
        phone_number = $phone_number,
        organization_name = $organization_name,
        gst_number = $gst_number,
        pan_number = $pan_number
      WHERE id = $customer_id
    `, {
      name,
      phone_number,
      organization_name: organization_name || null,
      gst_number: gst_number || null,
      pan_number: pan_number || null,
      customer_id,
    });

    const items = await db.queryAll(
      `
      SELECT
        cci.service_id,
        cci.quantity,
        s.price
      FROM customer_cart_items cci
      LEFT JOIN services s ON s.id = cci.service_id
      WHERE cci.customer_id = $1
    `,
      [customer_id],
    );

    const subTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = subTotal;

    const newOrder = await db.namedQueryOne(
      `
      INSERT INTO orders (
        customer_id,
        sub_total,
        total,
        dealer_id,
        serial_number,
        shipping_address,
        shipping_state_id,
        shipping_city,
        shipping_postal_code,
        billing_address,
        billing_state_id,
        billing_city,
        billing_postal_code,
        customer_name,
        organization_name,
        gst_number,
        pan_number
      )
      VALUES (
        $customer_id, $sub_total, $total, $dealer_id,
        (SELECT COALESCE(MAX(serial_number), 0) + 1 FROM orders),
        $shipping_address,
        $shipping_state_id,
        $shipping_city,
        $shipping_postal_code,
        $billing_address,
        $billing_state_id,
        $billing_city,
        $billing_postal_code,
        (SELECT name FROM customers WHERE id = $customer_id),
        (SELECT organization_name FROM customers WHERE id = $customer_id),
        (SELECT gst_number FROM customers WHERE id = $customer_id),
        (SELECT pan_number FROM customers WHERE id = $customer_id)
        )
      RETURNING id
    `,
      {
        customer_id,
        sub_total: subTotal,
        total,
        dealer_id,
        shipping_address,
        shipping_state_id,
        shipping_city,
        shipping_postal_code,
        billing_address,
        billing_state_id,
        billing_city,
        billing_postal_code,
      },
    );

    await db.query(`
        INSERT INTO order_items
          (order_id, service_id, quantity, price, gst_percentage)
        SELECT
          $1,
          s.id,
          cci.quantity,
          (s.price / 1.18),
          18
        FROM customer_cart_items cci
        LEFT JOIN services s ON s.id = cci.service_id
        WHERE customer_id = $2
      `, [newOrder.id, customer_id]);

    const newRazorpayOrder = await RazorpayInstance.orders.create({
      amount: total,
      currency: 'INR',
      receipt: `${newOrder.id}`,
      notes: {
        customer_id,
        order_id: newOrder.id,
        total,
      },
    });

    await db.query(
      `
      UPDATE orders SET razorpay_order_id = $1 WHERE id = $2
      `,
      [newRazorpayOrder.id, newOrder.id],
    );

    const shippingAddress = await db.queryOne(`
      SELECT id FROM customer_addresses WHERE customer_id = $1 AND type = 'shipping'
      `, [customer_id]);

    if (!shippingAddress) {
      await db.query(`
        INSERT INTO customer_addresses (address, state_id, city, postal_code, type, customer_id)
        VALUES ($1, $2, $3, $4, 'shipping', $5)
      `, [shipping_address, shipping_state_id, shipping_city, shipping_postal_code, customer_id]);
    } else {
      await db.query(`
        UPDATE customer_addresses SET address = $1, state_id = $2, city = $3, postal_code = $4 WHERE id = $5
      `, [shipping_address, shipping_state_id, shipping_city, shipping_postal_code, shippingAddress.id]);
    }

    const billingAddress = await db.queryOne(`
      SELECT id FROM customer_addresses WHERE customer_id = $1 AND type = 'billing'
      `, [customer_id]);

    if (!billingAddress) {
      await db.query(`
        INSERT INTO customer_addresses (address, state_id, city, postal_code, type, customer_id)
        VALUES ($1, $2, $3, $4, 'billing', $5)
      `, [billing_address, billing_state_id, billing_city, billing_postal_code, customer_id]);

    } else {
      await db.query(`
        UPDATE customer_addresses SET address = $1, state_id = $2, city = $3, postal_code = $4 WHERE id = $5
      `, [billing_address, billing_state_id, billing_city, billing_postal_code, billingAddress.id]);
    }

    await db.query('COMMIT');

    res.status(200).json(newRazorpayOrder);

  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }

};
