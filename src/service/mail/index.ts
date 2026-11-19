/* eslint-disable import/prefer-default-export */
import nodemailer, { type SentMessageInfo } from 'nodemailer';
import Vars from '@/config/var.js';

export async function SendMail(
  to: string,
  subject: string,
  html: string,
): Promise<SentMessageInfo> {
  const transporter = nodemailer.createTransport({
    host: Vars.smtp.host,
    port: Vars.smtp.port,
    secure: Vars.smtp.port === 465,
    auth: {
      user: Vars.smtp.user,
      pass: Vars.smtp.password,
    },
  });

  await transporter.verify();

  return transporter.sendMail({
    from: Vars.smtp.user,
    to,
    subject,
    html,
  });
}
