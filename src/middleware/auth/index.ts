import isRootUser from '@/middleware/auth/isRootUser.js';
import privateRoute from '@/middleware/auth/privateRoute.js';
import hasPermission from '@/middleware/auth/hasPermission.js';
import isCustomerLoggedIn from '@/middleware/auth/isCustomerLoggedIn.js';

export { isRootUser, privateRoute, hasPermission, isCustomerLoggedIn };
