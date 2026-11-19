import { Request, Response, NextFunction } from 'express';
import { Joi } from '@/utils/validationHelper.js';
import { DatabaseClient } from '@/service/database/index.js';
import { sendCsv } from '@/components/report/utils.js';
import validationSchema from '@/config/validationSchema.js';

export const ValidationSchema = {
  query: Joi.object({
    from: Joi.date().iso().required(),
    to: Joi.date().iso().required(),
    device_id: validationSchema.uuid().required(),
  }),
};

export const Controller = async (req: Request & { validatedQuery?: any }, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { from, to, device_id } = req.validatedQuery || {};

  // const rows = await db.namedQueryAll(
  const rows = await db.queryAll(
    `
      SELECT
        dl.device_id,
        dl.imei,
        dl.timestamp,
        dl.record,
        dl.created_at
      FROM device_logs dl
      WHERE dl.timestamp BETWEEN $1 AND $2
        AND dl.device_id = $3
      ORDER BY dl.timestamp DESC
    `,
    [from, to, device_id],
  );
  const processedRows = rows.map((row) => {
    const result = { ...row, ...row.record.io_elements, ...row.record.gps };
    delete result.record;
    return result;
  });

  sendCsv(res, 'device_logs.csv', processedRows);
};
