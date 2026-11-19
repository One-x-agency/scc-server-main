import { Request, Response, NextFunction } from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 as S3 } from '@/service/aws/config.js';
import Vars from '@/config/var.js';

export const ValidationSchema = {
  query: Joi.object({
    file_extension: Joi.string().required(),
  }),
};

export const Controller = async (req: Request, res: Response, next: NextFunction) => {
  const { file_extension } = req.validatedQuery;

  const file_name = `${uuidv4()}.${file_extension}`;

  const s3_key = `public/noc/${file_name}`;

  const putObjectCommand = new PutObjectCommand({
    Bucket: Vars.aws.s3Bucket,
    Key: s3_key,
  });

  const signedUrl = await getSignedUrl(S3, putObjectCommand, { expiresIn: 180 });

  res.status(200).json({
    signed_url: signedUrl,
    key: s3_key,
    file_name,
  });
};
