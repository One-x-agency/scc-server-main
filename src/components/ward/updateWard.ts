import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    ward_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    zone_id: Schema.uuid().required(),
    name: Schema.name().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { ward_id } = req.params;
  const { name, zone_id } = req.body;

  const updatedWard = await db.queryOne(
    'UPDATE wards SET name = $1, zone_id = $2 WHERE id = $3 RETURNING *',
    [name, zone_id, ward_id],
  );

  if (!updatedWard) throw new ServerError('NOT_FOUND', 'Ward not found');

  return res.status(204).send();
};
