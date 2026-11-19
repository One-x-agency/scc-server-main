import env from './env.js';

export default {
  serviceName: env.serviceName,
  env: env.env,
  port: Number(env.port),
  jwtSecret: env.jwtSecret,
  // masterKey: env.masterKey,

  database: {
    host: env.dbHost,
    port: Number(env.dbPort),
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbDatabase,
    sslMode: env.dbSslMode,
  },

  loggerOptions: {
    env: env.env,
    consoleLogLevel: env.consoleLogLevel,
    fileLogLevel: env.fileLogLevel,
    appName: env.serviceName,
  },

  smtp: {
    host: env.smtpHost,
    port: Number(env.smtpPort),
    user: env.smtpUser,
    password: env.smtpPassword,
  },

  whatsapp: {
    service: env.whatsappService,
  },

  chrome: {
    executablePath: env.chromeExecutablePath,
  },

  razorpay: {
    keyId: env.razorpayKeyId,
    keySecret: env.razorpayKeySecret,
  },

  aws: {
    accessKeyId: env.awsAccessKeyId,
    secretAccessKey: env.awsSecretAccessKey,
    region: env.awsRegion,
    s3Bucket: env.awsS3Bucket,
  },

};
