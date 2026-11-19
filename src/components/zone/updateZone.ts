import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    zone_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    fire_station_id: Schema.uuid().required(),
    name: Schema.name().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { zone_id } = req.params;
  const { name, fire_station_id } = req.body;

  const updatedZone = await db.queryOne(
    'UPDATE zones SET name = $1, fire_station_id = $2 WHERE id = $3 RETURNING *',
    [name, fire_station_id, zone_id],
  );

  if (!updatedZone) throw new ServerError('NOT_FOUND', 'Zonesadf not found');

  return res.status(204).send();
};
