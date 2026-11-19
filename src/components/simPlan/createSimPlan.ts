import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';

export const ValidationSchema = {
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
  const { name, sms_limit, data_limit, call_limit, subscription_amount, remark } = req.body as {
    name: string;
    sms_limit: number;
    data_limit: number;
    call_limit: number;
    subscription_amount: number;
    remark: string;
  };

  const newSimPlan = await db.namedQueryOne(
    `
      INSERT INTO sim_plans (name, sms_limit, data_limit, call_limit, subscription_amount, remark, created_by)
      VALUES ($name, $sms_limit, $data_limit, $call_limit, $subscription_amount, $remark, $created_by)
      RETURNING *
    `,
    {
      name,
      sms_limit,
      data_limit,
      call_limit,
      subscription_amount,
      remark,
      created_by: req.user.id,
    },
  );

  res.status(200).json(newSimPlan);
};
