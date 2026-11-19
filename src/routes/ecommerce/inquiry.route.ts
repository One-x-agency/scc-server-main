import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';

import { ValidationSchema as CreateInquiryValidationSchema, Controller as CreateInquiryController } from '@/components/inquiry/createInquiry.js';

const router = express.Router();

router.route('/')
  .post(validate(CreateInquiryValidationSchema), WithDatabase(CreateInquiryController));

export default router;
