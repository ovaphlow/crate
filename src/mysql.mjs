// @flow
// const mysql = require('mysql2');
import mysql from 'mysql2';

// const CONFIGURATION = require('./configuration');
import { CONFIG } from './configuration.mjs';

const pool /*: any */ = mysql.createPool({
  host: CONFIG.DB_HOST,
  user: CONFIG.DB_USERNAME,
  password: CONFIG.DB_PASSWORD,
  database: CONFIG.DB_NAME,
  waitForConnections: true,
  connectionLimit: CONFIG.PROC * 2,
  queueLimit: 0,
});

// module.exports = pool;
export default pool;
