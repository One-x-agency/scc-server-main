/* eslint-disable import/prefer-default-export */
import { S3Client } from '@aws-sdk/client-s3';
import Vars from '@/config/var.js';

export const s3 = new S3Client({
  region: Vars.aws.region,
  credentials: {
    accessKeyId: Vars.aws.accessKeyId,
    secretAccessKey: Vars.aws.secretAccessKey,
  },
});
