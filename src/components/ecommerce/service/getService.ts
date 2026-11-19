import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  params: Joi.object({
    service_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { service_id } = req.params;

  const service = await db.queryOne(
    `
      SELECT
        s.*,
        array_agg(
          jsonb_build_object(
            'id', f.id,
            'url', f.url
          )
        ) as images
      FROM services s
      LEFT JOIN service_images si ON si.service_id = s.id
      LEFT JOIN files f ON f.id = si.file_id
      WHERE s.id = $1
      GROUP BY s.id
    `,
    [service_id],
  );

  if (!service) {
    throw new ServerError('NOT_FOUND', 'Service not found');
  }

  res.status(200).json(service);
};
