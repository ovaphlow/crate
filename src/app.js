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
  let router = require('./route-favorite');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  let router = require('./feedback-route');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  let router = require('./route-journal');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  let router = require('./message-route');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  let router = require('./route-setting');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  let router = require('./route-subscriber');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

module.exports = app;
