const os = require('os');

const { Sequelize } = require('sequelize');

const logger = require('./winston');
const {
  DB_NAME,
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOST,
} = require('./configuration');

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  pool: {
    max: os.cpus().length,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: (msg) => logger.debug(msg),
  // logging: logger.debug.bind(logger)
});

async function check() {
  try {
    await sequelize.authenticate();
    logger.log('Connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
}

check();

module.exports = sequelize;
