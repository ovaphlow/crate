// @flow
// const mysql = require('mysql2');
import mysql from 'mysql2';

// const CONFIGURATION = require('./configuration');
import {
  DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME, PROC,
} from './configuration.mjs';

const pool /*: any */ = mysql.createPool({
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: PROC * 2,
  queueLimit: 0,
});

// module.exports = pool;
export default pool;
