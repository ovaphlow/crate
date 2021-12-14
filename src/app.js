const cluster = require('cluster');

// eslint-disable-next-line
if (cluster.isMaster) return;

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const logger = require('./winston');
const pool = require('./mysql');

const app = new Koa();

app.env = process.env.NODE_ENV === 'production' ? process.env.NODE_ENV : 'development';

app.use(bodyParser({ jsonLimit: '16mb' }));

app.use(async (ctx, next) => {
  logger.debug(`--> ${ctx.request.method} ${ctx.request.url}`);
  await next();
  logger.debug(`<-- ${ctx.request.method} ${ctx.request.url}`);
});

app.use(async (ctx, next) => {
  ctx.db_client = pool.promise();
  await next();
});

app.on('error', (err, ctx) => {
  logger.error(`${ctx.req.method} ${ctx.req.url}`);
  logger.error(err.stack);
});

(() => {
  const router = require('./captcha-route');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  const router = require('./favorite-route');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  const router = require('./feedback-route');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  const router = require('./journal-route');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  const router = require('./message-route');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  const router = require('./setting-route');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  const router = require('./subscriber-route');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

module.exports = app;
