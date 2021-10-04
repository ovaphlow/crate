const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'ovaphlow',
  waitForConnections: true,
  connectionLimit: 8,
  queueLimit: 0,
});

module.exports = pool;
