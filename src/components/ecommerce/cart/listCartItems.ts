import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';

const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const customer_id = req.customer.id;
  const cartItems = await db.queryAll(
    `
    SELECT
      cci.*,
      s.price,
      s.name,
      s.description,
      (s.price / 100)::numeric as price_in_rupees,
      array_agg(
        jsonb_build_object(
          'id', f.id,
          'url', f.url
        )
      ) as images
    FROM customer_cart_items cci
    LEFT JOIN services s ON cci.service_id = s.id
    LEFT JOIN service_images si ON si.service_id = s.id
    LEFT JOIN files f ON si.file_id = f.id
    WHERE cci.customer_id = $1
    GROUP BY cci.id, s.id
    `,
    [customer_id],
  );

  res.status(200).json(cartItems);
};

export default Controller;
