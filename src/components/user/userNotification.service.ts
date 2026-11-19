/* eslint-disable import/prefer-default-export */
import Database from '@/service/database/index.js';

import { sendMulticastMessage, Notification } from '@/service/notification/index.js';

const tokenValidationErrors = [
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/mismatched-credential',
  'messaging/invalid-argument',
];

export async function sendUserNotification(userId: string, notification: Notification) {

  const db = await Database.getConnection();
  try {
    const userTokens = await db.queryAll(`
    SELECT token FROM user_notification_tokens WHERE user_id = $1
  `, [userId]);

    if (userTokens.length === 0) return [];

    const results = await sendMulticastMessage(userTokens.map((token) => token.token), notification);

    console.log(results);

    const tokensToDelete = [];

    results.responses.forEach((result, index) => {
      if (!result.success && tokenValidationErrors.includes(result.error?.code)) {
        tokensToDelete.push(userTokens[index].token);
      }
    });

    if (tokensToDelete.length > 0) {
      await db.query(`
      DELETE FROM user_notification_tokens WHERE user_id = $1 AND token = ANY($2)
    `, [userId, tokensToDelete]);
    }

    return results;
  } finally {
    db.release();
  }

}
