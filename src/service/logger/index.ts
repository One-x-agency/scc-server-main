import winston from 'winston';
import config from './config.js';
import Vars from '@/config/var.js';

const { loggerOptions } = Vars;

const { format, transports } = winston;
const { combine, timestamp, printf, colorize, uncolorize } = format;

// Add custom levels and colors
winston.addColors(config.customLevels.colors);

// Time Stamp formate for logs
const TS = timestamp({ format: 'YYYY-MM-DD HH:mm:ss' });

// Log formate for console (different for transports)
const consoleFormate = {
  pretty: printf((info) => `${info.level} : ${info.message} ${info.stack ? `\n ${info.stack}` : ''}`),
  json: printf((info) => `{
    "timestamp": "${info.timestamp}",
    "level": "${info.level}",
    "service":"${info.service}",
    "message":"${info.message?.toString().trim()}",
    "stack": "${info.stack ? info.stack : ''}"
  },`),
};

// Log options for console
const consoleLogOptions = {
  level: loggerOptions.consoleLogLevel,
  handleExceptions: true,
  format: combine(TS, loggerOptions.env === 'dev' ? colorize() : uncolorize(), consoleFormate.pretty),
};

// Log options for file
const fileLogOptions = {
  level: loggerOptions.fileLogLevel,
  filename: 'logs/combine.log',
  maxSize: '1m',
  format: combine(TS, consoleFormate.json),
};

const logger = winston.createLogger({
  levels: config.customLevels.levels,
  defaultMeta: { service: loggerOptions.appName },
  transports: [
    new transports.Console(consoleLogOptions),
    new transports.File(fileLogOptions),
  ],
});

export default logger;
