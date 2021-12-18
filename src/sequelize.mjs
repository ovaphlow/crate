// @flow
import { cpus } from 'os';

import { Sequelize } from 'sequelize';

import { logger } from './winston.mjs';
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
