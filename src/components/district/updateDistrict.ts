import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    district_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    name: Schema.name().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { district_id } = req.params;
  const { name } = req.body;

  const updatedDistrict = await db.queryOne(
    'UPDATE districts SET name = $1 WHERE id = $2 RETURNING *',
    [name, district_id],
  );

  if (!updatedDistrict) throw new ServerError('NOT_FOUND', 'District not found');

  return res.status(204).send();
};
