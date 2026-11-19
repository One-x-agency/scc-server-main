import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  params: Joi.object({
    inquiry_id: Schema.uuid().required(),
  }),

  body: Joi.object({
    status: Joi.string().valid('pending', 'processing', 'cancelled', 'completed').required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { inquiry_id } = req.params;
  const { status } = req.body;

  const existingInquiry = await db.query(`
    UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *
  `, [status, inquiry_id]);

  if (!existingInquiry) throw new ServerError('NOT_FOUND', 'Inquiry not found');

  res.status(204).end();
};
