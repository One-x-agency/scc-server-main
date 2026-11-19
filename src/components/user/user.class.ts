import { UserCustomAlertSchema } from '@/types/user.type.js';
import { getUserCustomAlertSchemasByUserId } from './user.service.js';

export type UserInput = {
  id: string;
  custom_alert_schemas: UserCustomAlertSchema[];
};

function convertUserAlertSchemasToObject(customAlertSchemas: UserCustomAlertSchema[]): { [key: string]: UserCustomAlertSchema } {
  return customAlertSchemas.reduce((acc, schema) => {
    acc[schema.field_name] = schema;
    return acc;
  }, {} as { [key: string]: UserCustomAlertSchema });
}

class User {

  id: string;

  custom_alert_schemas : {
    [key: string]: UserCustomAlertSchema
  };

  constructor(data: UserInput) {
    this.id = data.id;
    this.custom_alert_schemas = convertUserAlertSchemasToObject(data.custom_alert_schemas);
  }

  async reload() {
    const userCustomAlertSchemas = await getUserCustomAlertSchemasByUserId(this.id);
    this.custom_alert_schemas = convertUserAlertSchemasToObject(userCustomAlertSchemas);
  }

}

export default User;
