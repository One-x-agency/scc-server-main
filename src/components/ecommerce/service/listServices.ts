import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
  query: Joi.object({

  }),
};

export async function listServices(db: DatabaseClient) {

  const services = await db.queryAll(`
    SELECT
      s.*,
      (s.price / 100)::numeric as price_in_rupees,
      array_agg(
        jsonb_build_object(
          'id', f.id,
          'url', f.url
        )
      ) as images
    FROM services s
    LEFT JOIN service_images si ON si.service_id = s.id
    LEFT JOIN files f ON si.file_id = f.id
    GROUP BY s.id
    ORDER BY s.price ASC
  `);

  return services;
}

export async function Controller(req: Request, res: Response, next: NextFunction, db: DatabaseClient) {

  const services = await listServices(db);

  res.status(200).json(services);
}
