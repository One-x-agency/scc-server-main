import Socket from '@/service/socket/index.js';
import { Record } from '@/types/device.type.js';
import Device from '@/components/device/device.class.js';
import Logger from '@/service/logger/index.js';
import { fetchDeviceByImei } from '@/components/device/device.service.js';
import Constants from '@/config/constant.js';
import { CreateDeviceAlert } from '@/components/device/alert/deviceAlert.service.js';
import { CreateDeviceLog } from '@/components/device/log/deviceLog.service.js';
import { sendDeviceAlertNotificationToCustomer } from '@/components/customer/customerNotification.service.js';
import { Notification } from '@/service/notification/index.js';
import { CustomerCustomAlertSchema } from '@/types/customer.type.js';
import { sendUserNotification } from '@/components/user/userNotification.service.js';

function generateValidatedIoElements(ioElements: { [key: string]: number}): { [key: string]: {value: number; is_safe: boolean}} {

  return Object.keys(ioElements).reduce((acc, key) => {
    acc[key] = { value: ioElements[key], is_safe: true };

    if (Constants.ioElementLabels[key].validate) {
      acc[key].is_safe = Constants.ioElementLabels[key].validate(ioElements[key]);
    }

    return acc;
  }, {} as {[key: string]: {value: number; is_safe: boolean}});
}

function getDeviceSystemStatus(ioElementsWithValidation: { [key: string]: {value: number | string; is_safe: boolean}}): string {

  let unsafe_element_priority = 0;

  Object.keys(ioElementsWithValidation).forEach((key) => {
    if (!ioElementsWithValidation[key].is_safe) {
      unsafe_element_priority = Math.max(unsafe_element_priority, Constants.ioElementLabels[key].priority);
    }
  });

  let currentDeviceSystemStatus = 'healthy';

  if (unsafe_element_priority >= 2) {
    currentDeviceSystemStatus = 'affected';
  } else if (unsafe_element_priority >= 1) {
    currentDeviceSystemStatus = 'unhealthy';
  } else {
    currentDeviceSystemStatus = 'healthy';
  }

  return currentDeviceSystemStatus;
}

function generateNotifications(
  oldIoElementsWithValidation: { [key: string]: {value: number | string; is_safe: boolean}},
  newIoElementsWithValidation: { [key: string]: {value: number | string; is_safe: boolean}},
): Notification[] {
  const notifications: Notification[] = [];

  Object.keys(newIoElementsWithValidation).forEach((key) => {
    if (oldIoElementsWithValidation) {
      if (oldIoElementsWithValidation[key]?.is_safe !== newIoElementsWithValidation[key]?.is_safe && !newIoElementsWithValidation[key]?.is_safe) {
        notifications.push({
          title: 'Fire System Alert',
          body: `unsafe value in ${key} : ${newIoElementsWithValidation[key].value}`,
          type: 'alert',
        });
      }
    } else if (!newIoElementsWithValidation[key].is_safe) {
      notifications.push({
        title: 'Fire System Alert',
        body: `unsafe value in ${key} : ${newIoElementsWithValidation[key].value}`,
        type: 'alert',
      });
    }
  });

  return notifications;
}

function compareValue(value: number, operator: CustomerCustomAlertSchema['operator'], valueToCompare: number) {

  switch (operator) {
    case '>':
      return value > valueToCompare;
    case '<':
      return value < valueToCompare;
    case '=':
      return value === valueToCompare;
    case '>=':
      return value >= valueToCompare;
    case '<=':
      return value <= valueToCompare;
    case '!=':
      return value !== valueToCompare;
    default:
      return false;
  }

}

async function generateCustomerNotifications(
  device : Device,
  ioElementsWithValidation: { [key: string]: {value: number; is_safe: boolean}},
): Promise<Notification[]> {
  if (!device.customer_id) return [];
  const customer = await device.getCustomer();
  if (!customer) return [];

  const alerts: Notification[] = [];

  Object.keys(ioElementsWithValidation).forEach((key) => {
    const alertSchema = customer.custom_alert_schemas[key];
    if (!alertSchema) return;

    const comparisonOperator = alertSchema.operator;
    const valueToCompare = alertSchema.value;

    const isConditionTrue = compareValue(ioElementsWithValidation[key].value, comparisonOperator, valueToCompare);

    if (device.last_record?.io_elements_with_validation?.[key]?.value !== undefined || device.last_record?.io_elements_with_validation?.[key]?.value !== null) {

      const lastRecordValue = device.last_record?.io_elements_with_validation?.[key]?.value;
      const isLastConditionTrue = compareValue(lastRecordValue, comparisonOperator, valueToCompare);

      if (isLastConditionTrue !== isConditionTrue && isConditionTrue) {
        alerts.push({
          type: 'alert',
          title: alertSchema.name,
          body: alertSchema.message || `unsafe value in ${key} : ${ioElementsWithValidation[key].value}`,
          device_id: device.id,
        });
      }

    } else if (isConditionTrue) {
      alerts.push({
        type: 'alert',
        title: alertSchema.name,
        body: alertSchema.message || `unsafe value in ${key} : ${ioElementsWithValidation[key].value}`,
        device_id: device.id,
      });
    }

  });

  return alerts;
}

async function generateUserNotifications(device: Device, ioElementsWithValidation: { [key: string]: {value: number; is_safe: boolean}}) {

  const users = await device.getUsers();
  if (!users || users.length === 0) return [];

  const userNotifications : {
    user_id: string;
    notifications: Notification[];
  }[] = [];

  users.forEach((usr) => {
    if (Object.keys(usr.custom_alert_schemas).length === 0) return;

    const alerts: Notification[] = [];

    Object.keys(ioElementsWithValidation).forEach((key) => {

      const alertSchema = usr.custom_alert_schemas[key];
      if (!alertSchema) return;

      const comparisonOperator = alertSchema.operator;
      const valueToCompare = alertSchema.value;

      const isConditionTrue = compareValue(ioElementsWithValidation[key].value, comparisonOperator, valueToCompare);

      if (device.last_record?.io_elements_with_validation?.[key]?.value !== undefined || device.last_record?.io_elements_with_validation?.[key]?.value !== null) {

        const lastRecordValue = device.last_record?.io_elements_with_validation?.[key]?.value;
        const isLastConditionTrue = compareValue(lastRecordValue, comparisonOperator, valueToCompare);

        if (isLastConditionTrue !== isConditionTrue && isConditionTrue) {
          alerts.push({
            type: 'alert',
            title: alertSchema.name,
            body: alertSchema.message || `unsafe value in ${key} : ${ioElementsWithValidation[key].value}`,
            device_id: device.id,
          });
        }

      } else if (isConditionTrue) {
        alerts.push({
          type: 'alert',
          title: alertSchema.name,
          body: alertSchema.message || `unsafe value in ${key} : ${ioElementsWithValidation[key].value}`,
          device_id: device.id,
        });
      }

    });

    if (alerts.length > 0) {
      userNotifications.push({
        user_id: usr.id,
        notifications: alerts,
      });
    }

  });

  return userNotifications;
}

async function handleNewRecord(record: Record): Promise<any> {

  try {

    const device = await fetchDeviceByImei(record.imei);

    if (!device) throw new Error(`Device not found: ${record.imei}`);

    const parsedRecord = device.parseRecord(record);

    // add is_safe field to the io_elements
    const ioElementsWithValidation = generateValidatedIoElements(parsedRecord.io_elements);

    // check if the values have changed and are safe. if values are unsafe then generate notification
    const notifications = generateNotifications(device.last_record?.io_elements_with_validation, ioElementsWithValidation);

    // get the current system status
    const currentDeviceSystemStatus = getDeviceSystemStatus(ioElementsWithValidation);

    const customerNotifications = await generateCustomerNotifications(device, ioElementsWithValidation);

    const userNotifications = await generateUserNotifications(device, ioElementsWithValidation);

    const recordToEmit = { ...parsedRecord, io_elements_with_validation: ioElementsWithValidation };

    CreateDeviceLog({ device_id: device.id, imei: device.imei, timestamp: recordToEmit.timestamp.toISOString(), record: recordToEmit });

    // emit the record to the device
    Socket.io?.to(device.imei).emit('record', recordToEmit);

    // emit the record to the device
    Socket.io?.to(device.imei).emit(`record:${device.imei}`, recordToEmit);

    // emit the system status change to the device
    if (currentDeviceSystemStatus !== device.system_status) {
      Socket.io?.to(device.imei).emit('record:change', { id: device.id, imei: device.imei, system_status: device.system_status, timestamp: recordToEmit.timestamp });
    }

    // emit the notifications to the device
    notifications.forEach((notification) => {
      Socket.io?.to(device.imei).emit('notification', notification);
      CreateDeviceAlert({ device_id: device.id, type: notification.type, message: notification.body });
    });

    if (notifications.length > 0 && currentDeviceSystemStatus === 'affected') {
      sendDeviceAlertNotificationToCustomer(device.id, {
        title: 'Fire System Alert',
        body: notifications.map((notification) => notification.body).join(', ') || 'Fire System Alert',
        type: currentDeviceSystemStatus === 'affected' ? 'fire' : 'alert',
        device_id: device.id,
      });
    }

    customerNotifications.forEach((notification) => {
      sendDeviceAlertNotificationToCustomer(device.id, notification);
    });

    userNotifications.forEach((userNotification) => {
      userNotification.notifications.forEach((notification) => {
        sendUserNotification(userNotification.user_id, notification);
      });
    });

    device.system_status = currentDeviceSystemStatus;
    device.last_record = recordToEmit;

  } catch (error) {
    return Logger.error('Error handling new record', error);
  }

  return true;
}

export default handleNewRecord;
