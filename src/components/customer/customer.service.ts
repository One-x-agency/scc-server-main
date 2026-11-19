/* eslint-disable import/prefer-default-export */
import Database from '@/service/database/index.js';
import { CustomerCustomAlertSchema } from '@/types/customer.type.js';
import MemoryStorage from '@/service/store/inMemoryStorage.js';
import Customer from './customer.class.js';

type CustomerNotification = {
  id: string;
  name: string;
  customer_id: string;
  description?: string;
  message?: string;
  field_name: string;
  operator: CustomerCustomAlertSchema['operator'];
  value: number;
}

export async function getCustomerCustomAlertSchemasByCustomerId(customer_id: string): Promise<CustomerNotification[]> {
  const db = await Database.getConnection();
  try {
    const customerNotifications: CustomerNotification[] = await db.queryAll(`
      SELECT
        id,
        name,
        customer_id,
        description,
        message,
        field_name,
        operator,
        value
      FROM customer_custom_alert_schemas
      WHERE
        customer_id = $1
    `, [customer_id]);

    return customerNotifications;
  } finally {
    db.release();
  }
}

export async function fetchCustomerById(customer_id: string): Promise<Customer> {
  let customer = MemoryStorage.customers[customer_id];
  if (!customer) {
    const customerAlerts = await getCustomerCustomAlertSchemasByCustomerId(customer_id);

    customer = new Customer({
      id: customer_id,
      custom_alert_schemas: customerAlerts,
    });

    MemoryStorage.customers[customer_id] = customer;
  }
  return customer;
}
