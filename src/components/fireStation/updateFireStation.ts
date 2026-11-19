import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    fire_station_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    state_id: Schema.uuid().required(),
    name: Schema.name().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { fire_station_id } = req.params;
  const { name, state_id } = req.body;

  const updatedFireStation = await db.queryOne(
    'UPDATE fire_stations SET name = $1, state_id = $2 WHERE id = $3 RETURNING *',
    [name, state_id, fire_station_id],
  );

  if (!updatedFireStation) throw new ServerError('NOT_FOUND', 'Fire station not found');

  return res.status(204).send();
};
