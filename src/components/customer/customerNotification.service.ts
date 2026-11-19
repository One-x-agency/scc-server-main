/* eslint-disable import/prefer-default-export */
import Logger from '@/service/logger/index.js';
import Database, { DatabaseClient } from '@/service/database/index.js';

import { sendMulticastMessage, Notification } from '@/service/notification/index.js';

const tokenValidationErrors = [
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/mismatched-credential',
  'messaging/invalid-argument',
];

export async function sendCustomerNotification(db: DatabaseClient, customerId: string, notification: Notification) {

  const customerTokens = await db.queryAll(`
    SELECT token FROM customer_notification_tokens WHERE customer_id = $1
  `, [customerId]);

  if (customerTokens.length === 0) return [];

  const results = await sendMulticastMessage(customerTokens.map((token) => token.token), notification);

  console.log(results);

  const tokensToDelete = [];

  results.responses.forEach((result, index) => {
    if (!result.success && tokenValidationErrors.includes(result.error?.code)) {
      tokensToDelete.push(customerTokens[index].token);
    }
  });

  if (tokensToDelete.length > 0) {
    await db.query(`
      DELETE FROM customer_notification_tokens WHERE customer_id = $1 AND token = ANY($2)
    `, [customerId, tokensToDelete]);
  }

  return results;
}

export async function sendDeviceAlertNotificationToCustomer(device_id: string, notification: Notification) {
  const db = await Database.getConnection();
  try {
    const device = await db.queryOne(`
      SELECT id, customer_id FROM devices WHERE id = $1
    `, [device_id]);

    if (!device.customer_id) return;

    await sendCustomerNotification(
      db,
      device.customer_id,
      {
        title: notification.title,
        body: notification.body,
        type: notification.type,
        device_id,
      },
    );

  } catch (error) {
    Logger.error(`Error sending device alert notification to customer: ${error}`);
  } finally {
    db.release();
  }
}
