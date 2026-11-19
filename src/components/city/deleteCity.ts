import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  params: Joi.object({
    city_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { city_id } = req.params;

  const deletedCity = await db.queryOne(
    'DELETE FROM cities WHERE id = $1 RETURNING *',
    [city_id],
  );

  if (!deletedCity) throw new ServerError('NOT_FOUND', 'City not found');

  return res.status(204).send();
};
