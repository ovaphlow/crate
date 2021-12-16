// @flow
// const winston = require('winston');
import winston from 'winston';

export const logger /*: any */ = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.label({ label: 'crate' }),
        winston.format.timestamp(),
        winston.format.printf(
          ({
            level, message, label, timestamp,
          }) => `${timestamp} [${label}] ${level}: ${message}`,
        ),
      ),
    }),
    new winston.transports.File({
      level: 'info',
      filename: 'crate.log',
      format: winston.format.combine(
        winston.format.label({ label: 'crate' }),
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});

// module.exports = logger;
export default logger;
