import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  params: Joi.object({
    district_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { district_id } = req.params;

  const deletedDistrict = await db.queryOne(
    'DELETE FROM districts WHERE id = $1 RETURNING *',
    [district_id],
  );

  if (!deletedDistrict) throw new ServerError('NOT_FOUND', 'District not found');

  return res.status(204).send();
};
