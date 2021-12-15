// @flow
const mysql = require('mysql2');

const CONFIGURATION = require('./configuration');

const pool /*: any */ = mysql.createPool({
  host: CONFIGURATION.DB_HOST,
  user: CONFIGURATION.DB_USERNAME,
  password: CONFIGURATION.DB_PASSWORD,
  database: CONFIGURATION.DB_NAME,
  waitForConnections: true,
  connectionLimit: CONFIGURATION.NODE_PROC * 2,
  queueLimit: 0,
});

module.exports = pool;
