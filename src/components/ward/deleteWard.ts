import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  params: Joi.object({
    ward_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { ward_id } = req.params;

  const deletedWard = await db.queryOne(
    'DELETE FROM wards WHERE id = $1 RETURNING *',
    [ward_id],
  );

  if (!deletedWard) throw new ServerError('NOT_FOUND', 'Ward not found');

  return res.status(204).send();
};
