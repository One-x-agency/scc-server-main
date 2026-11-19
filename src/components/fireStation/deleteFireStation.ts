import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  params: Joi.object({
    fire_station_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { fire_station_id } = req.params;

  const deletedFireStation = await db.queryOne(
    'DELETE FROM fire_stations WHERE id = $1 RETURNING *',
    [fire_station_id],
  );

  if (!deletedFireStation) throw new ServerError('NOT_FOUND', 'Fire station not found');

  return res.status(204).send();
};
