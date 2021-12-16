// @flow
// const os = require('os');
import { cpus } from 'os';

// const { Sequelize } = require('sequelize');
import { Sequelize } from 'sequelize';

// const logger = require('./winston');
import { logger } from './winston.mjs';
// const {
//   DB_NAME,
//   DB_USERNAME,
//   DB_PASSWORD,
//   DB_HOST,
// } = require('./configuration');
import {
  DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD,
} from './configuration.mjs';

export const sequelize /*: any */ = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  pool: {
    max: cpus().length,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: (msg) => logger.debug(msg),
});

// module.exports = sequelize;
export default sequelize;
