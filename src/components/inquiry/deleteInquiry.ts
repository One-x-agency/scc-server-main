import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { DatabaseClient } from '@/service/database/index.js';
import ServerError from '@/utils/serverError.js';
import Schema from '@/config/validationSchema.js';

export const ValidationSchema = {
  params: Joi.object({
    inquiry_id: Schema.uuid().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {
  const { inquiry_id } = req.params;

  const existingInquiry = await db.query(`
    DELETE FROM inquiries WHERE id = $1
    RETURNING *
  `, [inquiry_id]);

  if (!existingInquiry) throw new ServerError('NOT_FOUND', 'Inquiry not found');

  res.status(204).end();
};
