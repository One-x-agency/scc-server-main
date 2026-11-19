import express from 'express';
import { validate } from '@/utils/validationHelper.js';
import { privateRoute } from '@/middleware/auth/index.js';

import { ValidationSchema as GetUploadUrlValidationSchema, Controller as GetUploadUrlController } from '@/components/file/getUploadUrl.js';

const router = express.Router();

router.route('/get-upload-url')
  .get(privateRoute, validate(GetUploadUrlValidationSchema), GetUploadUrlController);

export default router;
