const cluster = require('cluster');
const http = require('http');

const app = require('./app');
const logger = require('./winston');

if (require.main === module) {
  const port = parseInt(process.env.NODE_PORT, 10) || 8421;
  if (cluster.isMaster) {
    logger.info(`主进程 PID:${process.pid}`);

    for (let i = 0; i < parseInt(process.env.NODE_PROC || 1, 10); i += 1) {
      cluster.fork();
    }

    cluster.on('online', (worker) => {
      logger.info(`子进程 PID:${worker.process.pid}, 端口:${port}`);
    });

    cluster.on('exit', (worker, code, signal) => {
      logger.warn(`子进程 PID:${worker.process.pid}终止，错误代码:${code}，信号:${signal}`);
      logger.info(`由主进程(PID:${process.pid})创建新的子进程`);
      cluster.fork();
    });
  } else {
    http.createServer(app.callback()).listen(port);
  }
}
