import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  params: Joi.object({
    sim_plan_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { sim_plan_id } = req.params;

  const existingSimPlan = await db.queryOne(
    'SELECT * FROM sim_plans WHERE id = $1',
    [sim_plan_id],
  );

  if (!existingSimPlan) {
    throw new ServerError('NOT_FOUND', 'Sim plan not found');
  }

  await db.query(
    'DELETE FROM sim_plans WHERE id = $1',
    [sim_plan_id],
  );

  res.status(200).json({ message: 'Sim plan deleted successfully' });
};
