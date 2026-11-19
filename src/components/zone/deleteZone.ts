import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  params: Joi.object({
    zone_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { zone_id } = req.params;

  const deletedZone = await db.queryOne(
    'DELETE FROM zones WHERE id = $1 RETURNING *',
    [zone_id],
  );

  if (!deletedZone) throw new ServerError('NOT_FOUND', 'Zone not foound');

  return res.status(204).send();
};
