import { Request, Response, NextFunction } from 'express';
import { Joi } from '@/utils/validationHelper.js';
import { DatabaseClient } from '@/service/database/index.js';
import { sendCsv } from '@/components/report/utils.js';

export const ValidationSchema = {
  query: Joi.object({
    search: Joi.string().trim().allow(''),
  }),
};

export const Controller = async (req: Request & { validatedQuery?: any }, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { search } = req.validatedQuery || {};

  const rows = await db.namedQueryAll(
    `
      SELECT
        d.id,
        d.serial,
        d.imei,
        d.name,
        d.brand,
        d.model_number,
        d.system_type,
        d.occupancy_type,
        d.number_of_floors,
        d.number_of_blocks,
        d.number_of_zones,
        d.address,
        d.latitude,
        d.longitude,
        d.created_at,
        d.updated_at,
        d.customer_id,
        d.sim_card_id
      FROM devices d
      WHERE (
        $search::text IS NULL
        OR d.name ILIKE '%' || $search || '%'
        OR d.imei ILIKE '%' || $search || '%'
        OR d.brand ILIKE '%' || $search || '%'
        OR d.model_number ILIKE '%' || $search || '%'
        )
      ORDER BY d.created_at DESC
    `,
    { search: search || null },
  );

  sendCsv(res, 'devices.csv', rows);
};
