import { CustomerCustomAlertSchema } from '@/types/customer.type.js';
import { getCustomerCustomAlertSchemasByCustomerId } from './customer.service.js';

export type CustomerInput = {
  id: string;
  custom_alert_schemas: CustomerCustomAlertSchema[]
};

function convertCustomAlertSchemasToObject(customAlertSchemas: CustomerCustomAlertSchema[]): { [key: string]: CustomerCustomAlertSchema } {
  return customAlertSchemas.reduce((acc, schema) => {
    acc[schema.field_name] = schema;
    return acc;
  }, {} as { [key: string]: CustomerCustomAlertSchema });
}

class Customer {
  id: string;

  custom_alert_schemas : {
    [key: string]: CustomerCustomAlertSchema
  };

  constructor(data: CustomerInput) {
    this.id = data.id;
    this.custom_alert_schemas = convertCustomAlertSchemasToObject(data.custom_alert_schemas);
  }

  async reload() {
    const customerAlerts = await getCustomerCustomAlertSchemasByCustomerId(this.id);
    this.custom_alert_schemas = convertCustomAlertSchemasToObject(customerAlerts);
  }
}

export default Customer;
