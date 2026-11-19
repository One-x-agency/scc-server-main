import dotenv from 'dotenv';
import Joi from 'joi';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
  path: path.join(__dirname, '../../.env'),
  override: true,
});

const env = {
  env: process.env.NODE_ENV || 'local',
  port: process.env.SERVER_PORT || 3007,
  serviceName: process.env.SERVICE_NAME || 's_manager',
  jwtSecret: process.env.JWT_SECRET,

  // Database
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbDatabase: process.env.DB_NAME,
  dbSslMode: process.env.DB_SSL_MODE || false,

  // Log levels
  consoleLogLevel: process.env.CONSOLE_LOG_LEVEL || 'info',
  fileLogLevel: process.env.FILE_LOG_LEVEL || 'false',

  // Whatsapp
  whatsappService: process.env.WHATSAPP_SERVICE || false,

  // Chrome
  chromeExecutablePath: process.env.CHROME_EXECUTABLE_PATH,

  // SMTP
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,

  // AWS
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION,
  awsS3Bucket: process.env.AWS_S3_BUCKET,

  // Razorpay
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
};

// Define validation for all the env vars
const envSchema = Joi.object({
  env: Joi.string().required().valid('local', 'dev', 'stage', 'prod'),
  port: Joi.number().required().min(0).max(65535),
  serviceName: Joi.string().required().min(3).max(255),
  jwtSecret: Joi.string().required().min(3).max(1024),

  // Database
  dbHost: Joi.string().required().min(3).max(255),
  dbPort: Joi.number().required().min(1024).max(65535),
  dbUser: Joi.string().required().min(3).max(255),
  dbPassword: Joi.string().allow(''),
  dbDatabase: Joi.string().required().min(3).max(255),
  dbSslMode: Joi.boolean().default(false).required(),

  // Log levels
  consoleLogLevel: Joi.string().required().valid('false', 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'),
  fileLogLevel: Joi.string().required().valid('false', 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'),

  // Whatsapp
  whatsappService: Joi.boolean().required(),

  // Chrome
  chromeExecutablePath: Joi.string().max(500).allow(''),

  // SMTP
  smtpHost: Joi.string().required().min(3).max(255),
  smtpPort: Joi.number().required().min(0).max(65535),
  smtpUser: Joi.string().required().min(3).max(255),
  smtpPassword: Joi.string().allow(''),

  // AWS
  awsAccessKeyId: Joi.string().required().min(3).max(255),
  awsSecretAccessKey: Joi.string().required().min(3).max(255),
  awsRegion: Joi.string().required().min(3).max(255),
  awsS3Bucket: Joi.string().required().min(3).max(255),

  // Razorpay
  razorpayKeyId: Joi.string().required().min(3).max(255),
  razorpayKeySecret: Joi.string().required().min(3).max(255),
});

// Validate env vars
const { error, value } = envSchema.validate(env);

// Throw an error if env vars are not valid
if (error) throw new Error(`ENV validation error: ${error.message}`);

export default value as typeof env;
