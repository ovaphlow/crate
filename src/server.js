// @flow
const cluster = require('cluster');
// import cluster from 'cluster';
const http = require('http');
// import http from 'http';

require('dotenv').config();
// import dotenv from 'dotenv';

const app = require('./app');
// import app from './app';
const logger = require('./winston');
// import logger from './winston';

// dotenv.config();

const port = parseInt(process.env.PORT, 10) || 8421;

if (cluster.isMaster) {
  logger.info(`主进程 PID:${process.pid}`);

  for (let i = 0; i < parseInt(process.env.PROC || 1, 10); i += 1) {
    cluster.fork();
  }

  cluster.on('online', (worker) => {
    logger.info(`子进程 PID:${worker.process.pid}, 端口:${port}`);
  });

  cluster.on('exit', (worker, code, signal) => {
    logger.error(`子进程 PID:${worker.process.pid}终止，错误代码:${code}，信号:${signal}`);
    logger.info(`由主进程(PID:${process.pid})创建新的子进程`);
    cluster.fork();
  });
} else {
  http.createServer(app.callback()).listen(port);
}
