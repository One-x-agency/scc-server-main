/* eslint-disable import/prefer-default-export */
import Database from '@/service/database/index.js';
import { UserCustomAlertSchema } from '@/types/user.type.js';
import User from './user.class.js';

export async function getUserCustomAlertSchemasByUserId(user_id: string): Promise<UserCustomAlertSchema[]> {
  const db = await Database.getConnection();
  try {
    const userCustomAlertSchemas: UserCustomAlertSchema[] = await db.queryAll(`
      SELECT
        id,
        name,
        user_id,
        description,
        message,
        field_name,
        operator,
        value
      FROM user_custom_alert_schemas
      WHERE
        user_id = $1
    `, [user_id]);

    return userCustomAlertSchemas;
  } finally {
    db.release();
  }
}

export async function fetchUsersByAssignedDeviceId(device_id: string): Promise<User[]> {
  const db = await Database.getConnection();
  try {
    const users = await db.queryAll<{
      id: string;
      custom_alert_schemas: UserCustomAlertSchema[];
    }>(`
      select
        u.id,
        COALESCE(json_agg(json_build_object(
          'id', uas.id,
          'name', uas.name,
          'description', uas.description,
          'message', uas.message,
          'field_name', uas.field_name,
          'operator', uas.operator,
          'value', uas.value,
          'user_id', uas.user_id
        )), '[]') as custom_alert_schemas
      from users u
      left join user_custom_alert_schemas uas on uas.user_id = u.id
      where
        user_id in (select user_id from user_device_mapping where device_id = $1) or
        user_id = (select id from users where is_root_user = true)
      group by u.id
    `, [device_id]);

    const userClasses = users.map((usr) => new User({
      id: usr.id,
      custom_alert_schemas: usr.custom_alert_schemas,
    }));

    return userClasses;
  } finally {
    db.release();
  }
}
