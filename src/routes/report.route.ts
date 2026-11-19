import express from 'express';
import WithDatabase from '@/utils/withDatabase.js';
import { validate } from '@/utils/validationHelper.js';
import { privateRoute, hasPermission } from '@/middleware/auth/index.js';

import { ValidationSchema as DeviceLogsValidationSchema, Controller as DeviceLogsController } from '@/components/report/deviceLogsReport.js';
import { ValidationSchema as DeviceReportValidationSchema, Controller as DeviceReportController } from '@/components/report/deviceReport.js';
import { ValidationSchema as UserReportValidationSchema, Controller as UserReportController } from '@/components/report/userReport.js';
import { ValidationSchema as CustomerReportValidationSchema, Controller as CustomerReportController } from '@/components/report/customerReport.js';
import { ValidationSchema as OrderReportValidationSchema, Controller as OrderReportController } from '@/components/report/orderReport.js';
import { ValidationSchema as DealerReportValidationSchema, Controller as DealerReportController } from '@/components/report/dealerReport.js';
import { ValidationSchema as PaymentReportValidationSchema, Controller as PaymentReportController } from '@/components/report/paymentReport.js';
import { ValidationSchema as InquiryReportValidationSchema, Controller as InquiryReportController } from '@/components/report/inquiryReport.js';

const router = express.Router();

router.get('/device-log', privateRoute, hasPermission('report', 1), validate(DeviceLogsValidationSchema), WithDatabase(DeviceLogsController));
router.get('/device', privateRoute, hasPermission('report', 1), validate(DeviceReportValidationSchema), WithDatabase(DeviceReportController));
router.get('/user', privateRoute, hasPermission('report', 1), validate(UserReportValidationSchema), WithDatabase(UserReportController));
router.get('/customer', privateRoute, hasPermission('report', 1), validate(CustomerReportValidationSchema), WithDatabase(CustomerReportController));
router.get('/order', privateRoute, hasPermission('report', 1), validate(OrderReportValidationSchema), WithDatabase(OrderReportController));
router.get('/dealer', privateRoute, hasPermission('report', 1), validate(DealerReportValidationSchema), WithDatabase(DealerReportController));
router.get('/payment', privateRoute, hasPermission('report', 1), validate(PaymentReportValidationSchema), WithDatabase(PaymentReportController));
router.get('/inquiry', privateRoute, hasPermission('report', 1), validate(InquiryReportValidationSchema), WithDatabase(InquiryReportController));

export default router;
