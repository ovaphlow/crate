const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.label({ label: 'crate' }),
        winston.format.timestamp(),
        winston.format.printf(
          ({ level, message, label, timestamp }) => `${timestamp} [${label}] ${level}: ${message}`,
        ),
      ),
    }),
    new winston.transports.File({
      level: 'info',
      filename: 'crate-logbook.log',
      format: winston.format.json(),
    }),
  ],
});

module.exports = logger;
