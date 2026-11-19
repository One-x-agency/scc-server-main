import express from 'express';

import authRoute from '@/routes/ecommerce/auth.route.js';
import deviceRoute from '@/routes/ecommerce/device.route.js';
import serviceRoute from '@/routes/ecommerce/service.route.js';
import orderRoute from '@/routes/ecommerce/order.route.js';
import cartRoute from '@/routes/ecommerce/cart.route.js';
import accountRoute from '@/routes/ecommerce/account.route.js';
import inquiryRoute from '@/routes/ecommerce/inquiry.route.js';
import reportRoute from '@/routes/ecommerce/report.route.js';
import customAlertSchemaRoute from '@/routes/ecommerce/customAlertSchema.route.js';
import notificationTokenRoute from '@/routes/ecommerce/notificationToken.route.js';
import stateRoute from '@/routes/ecommerce/state.route.js';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/devices', deviceRoute);
router.use('/services', serviceRoute);
router.use('/orders', orderRoute);
router.use('/cart', cartRoute);
router.use('/account', accountRoute);
router.use('/inquiries', inquiryRoute);
router.use('/reports', reportRoute);
router.use('/custom-alert-schemas', customAlertSchemaRoute);
router.use('/notification-tokens', notificationTokenRoute);
router.use('/states', stateRoute);

export default router;
