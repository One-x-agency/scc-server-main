import Joi from 'joi';
import constant from './constant.js';

const uuid = () => Joi.string().guid({ version: 'uuidv4' });
const ioElementLabel = () => Joi.string().valid(...Object.keys(constant.ioElementLabels));
const ioElementParameterId = () => Joi.string().valid(...Object.keys(constant.ioElementParameterIds));

export default {
  uuid,

  name: () => Joi.string().trim().max(200),

  imei: () => Joi.string().max(15),

  date: () => Joi.date().iso(),

  gender: () => Joi.string().valid('male', 'female'),

  phoneNumber: () => Joi.string().pattern(/^[0-9]{10}$/).message('Phone number must be 10 digits'),

  email: () => Joi.string().email().message('Invalid email address'),

  gstNumber: () => Joi.string().length(15).message('GST number must be 15 characters long'),

  panNumber: () => Joi.string().length(10).message('PAN number must be 10 characters long'),

  month: () => Joi.number().min(0).max(11).message('Invalid month'),

  year: () => Joi.number().integer().min(2000).max(3000)
    .message('Invalid year'),

  password: () => Joi.string().min(5).max(30).message('Password must be between 5 and 30 characters'),

  fileName: () => Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-zA-Z0-9]+$/)
    .message('Invalid file name format. Must be UUID followed by file extension'),

  percentage: () => Joi.number().min(0).max(100).message('Percentage must be between 0 and 100'),

  address: () => Joi.string().min(3).max(500).message('Address must be between 5 and 500 characters'),

  remark: () => Joi.string().trim().max(500).allow('', null)
    .message('Remark must be less than 500 characters'),

  info: () => Joi.string().trim().max(500).allow('')
    .message('Info must be less than 500 characters'),

  description: () => Joi.string().trim().max(500).allow('')
    .message('Description must be less than 500 characters'),

  file: () => Joi.object(),

  barcode: () => Joi.string().length(6).pattern(/^[0-9]+$/).message('Barcode must contain only digits (6 digits)'),

  pagination: {
    offset: () => Joi.number().min(0).default(0),
    limit: () => Joi.number().min(1).max(100).default(30),
  },

  sort_orders: (...fields) => Joi.array().items(Joi.object({
    field: Joi.string().valid(...fields).required(),
    order: Joi.string().valid('asc', 'desc').required(),
  })).unique((a, b) => a.field === b.field),

  user: {

  },

  device: {
    occupancyType: () => Joi.string().valid(...constant.occupancyTypes),
    systemType: () => Joi.string().valid('conventional', 'addressable'),
    alternative_contacts: () => Joi.array().items(Joi.object({
      name: Joi.string().trim().max(255).required(),
      phone_number: Joi.string().pattern(/^[0-9]{10}$/).message('Phone number must be 10 digits').required(),
      designation: Joi.string().trim().max(255).required(),
    })).default([]),
    pumps: () => Joi.array().items(Joi.object({
      type: Joi.string().trim().max(255).required(),
      brand: Joi.string().trim().max(255).required(),
      horsepower: Joi.number().min(0).max(10000).required(),
    })).default([]),
  },

  order: {
    status: () => Joi.string().valid(...constant.orderStatuses),
  },

  calibration: () => Joi.array().items(Joi.object({
    voltage: Joi.number().required(),
    value: Joi.number().required(),
  })).min(2).max(100),

  ioElement: {
    pinMapping: () => Joi.object()
      .pattern(
        ioElementParameterId().required(),
        ioElementLabel().required(),
      ).min(1).max(100)
      .custom((value, helpers) => {
        const values = Object.values(value);
        if (values.length !== new Set(values).size) return helpers.error('any.duplicate');
        return value;
      }),
    label: ioElementLabel,
    parameterId: ioElementParameterId,
  },

  dealer: {
    transaction: {
      type: () => Joi.string().valid('in', 'out'),
    },
    withdrawRequest: {
      status: () => Joi.string().valid('pending', 'processing', 'completed', 'cancelled'),
    },
  },

  customer: {
    alert: {
      fieldName: () => ioElementLabel(),
      operator: () => Joi.string().valid(...constant.customerAlertOperators),
      value: () => Joi.number(),
      name: () => Joi.string().trim().max(50),
      description: () => Joi.string().trim().max(700),
      message: () => Joi.string().trim().max(700),
    },
  },
};
