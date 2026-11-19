import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import { privateRoute, hasPermission } from '@/middleware/auth/index.js';

import { ValidationSchema as ListInquiriesValidationSchema, Controller as ListInquiriesController } from '@/components/inquiry/listInquiries.js';
import { ValidationSchema as CreateInquiryValidationSchema, Controller as CreateInquiryController } from '@/components/inquiry/createInquiry.js';
import { ValidationSchema as DeleteInquiryValidationSchema, Controller as DeleteInquiryController } from '@/components/inquiry/deleteInquiry.js';
import { ValidationSchema as UpdateInquiryStatusValidationSchema, Controller as UpdateInquiryStatusController } from '@/components/inquiry/updateInquiryStatus.js';
import { ValidationSchema as GetInquiryValidationSchema, Controller as GetInquiryController } from '@/components/inquiry/getInquiry.js';

const router = express.Router();

router.route('/')
  .get(privateRoute, hasPermission('inquiry', 1), validate(ListInquiriesValidationSchema), WithDatabase(ListInquiriesController))
  .post(validate(CreateInquiryValidationSchema), WithDatabase(CreateInquiryController));

router.route('/:inquiry_id')
  .put(privateRoute, hasPermission('inquiry', 2), validate(UpdateInquiryStatusValidationSchema), WithDatabase(UpdateInquiryStatusController))
  .get(privateRoute, hasPermission('inquiry', 2), validate(GetInquiryValidationSchema), WithDatabase(GetInquiryController))
  .delete(privateRoute, hasPermission('inquiry', 3), validate(DeleteInquiryValidationSchema), WithDatabase(DeleteInquiryController));

export default router;
