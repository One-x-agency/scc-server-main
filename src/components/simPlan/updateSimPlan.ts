import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';

export const ValidationSchema = {
  params: Joi.object({
    sim_plan_id: Schema.uuid().required(),
  }),
  body: Joi.object({
    name: Schema.name().required(),
    sms_limit: Joi.number().min(0).optional(),
    data_limit: Joi.number().min(0).optional(),
    call_limit: Joi.number().min(0).optional(),
    subscription_amount: Joi.number().min(0).optional(),
    remark: Schema.remark().allow('', null).default(''),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { sim_plan_id } = req.params;
  const { name, sms_limit, data_limit, call_limit, subscription_amount, remark } = req.body as {
    name: string;
    sms_limit: number;
    data_limit: number;
    call_limit: number;
    subscription_amount: number;
    remark: string;
  };

  const simPlan = await db.namedQueryOne(
    `
      UPDATE sim_plans
      SET
        name = $name,
        sms_limit = $sms_limit,
        data_limit = $data_limit,
        call_limit = $call_limit,
        subscription_amount = $subscription_amount,
        remark = $remark,
        updated_at = current_timestamp,
        updated_by = $updated_by
      WHERE id = $sim_plan_id
      RETURNING *
    `,
    {
      name,
      sms_limit,
      data_limit,
      call_limit,
      subscription_amount,
      remark,
      sim_plan_id,
      updated_by: req.user.id,
    },
  );

  if (!simPlan) throw new ServerError('NOT_FOUND', 'Sim plan not found');

  res.status(204).end();
};
