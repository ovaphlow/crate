const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const logger = require('./winston');

const app = new Koa();

app.env = process.env.NODE_ENV === 'production' ? process.env.NODE_ENV : 'development';

app.use(bodyParser({ jsonLimit: '16mb' }));

app.use(async (ctx, next) => {
  logger.debug(`--> ${ctx.request.method} ${ctx.request.url}`);
  await next();
  logger.debug(`<-- ${ctx.request.method} ${ctx.request.url}`);
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
  let router = require('./route-feedback');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  let router = require('./route-journal');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

(() => {
  let router = require('./route-subscriber');
  app.use(router.routes());
  app.use(router.allowedMethods());
})();

module.exports = app;
