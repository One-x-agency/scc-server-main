import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    city_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    district_id: Schema.uuid().required(),
    name: Schema.name().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { city_id } = req.params;
  const { name, district_id } = req.body;

  const updatedCity = await db.queryOne(
    'UPDATE cities SET name = $1, district_id = $2 WHERE id = $3 RETURNING *',
    [name, district_id, city_id],
  );

  if (!updatedCity) throw new ServerError('NOT_FOUND', 'City not found');

  return res.status(204).send();
};
