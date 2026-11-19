import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Schema from '@/config/validationSchema.js';
import { DatabaseClient } from '@/service/database/index.js';
import { SendMail } from '@/service/mail/index.js';
import newInquiryEmail from '@/utils/emailTemplates/newInquiry.js';

export const ValidationSchema = {
  body: Joi.object({
    name: Schema.name().required(),
    email: Schema.email().required(),
    phone_number: Schema.phoneNumber().required(),
    message: Schema.remark().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction, db: DatabaseClient) => {

  const { name, email, phone_number, message } = req.body;

  const inquiry = await db.queryOne(`
    INSERT INTO inquiries (name, email, phone_number, message)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [name, email, phone_number, message]);

  SendMail('rraiyani62@gmail.com', 'New Inquiry', newInquiryEmail({
    name,
    email,
    phone_number,
    message,
  }));

  res.status(200).json(inquiry);

};
