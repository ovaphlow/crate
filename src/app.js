// @flow
const cluster = require('cluster');

const Koa = require('koa');

const app /*: any */ = new Koa();

(() => {
  if (cluster.isMaster) return;

  const bodyParser = require('koa-bodyparser');
  const rewrite = require('koa-rewrite');

  const logger = require('./winston');
  const pool = require('./mysql');

  app.use(bodyParser({ jsonLimit: '16mb' }));

  app.use(rewrite(/^\/api\/miscellaneous\/setting(.*)/, '/api/crate/single/setting$1'));

  app.use(async (ctx, next) => {
    logger.debug(`--> ${ctx.request.method} ${ctx.request.url}`);
    await next();
    logger.debug(`<-- ${ctx.request.method} ${ctx.request.url}`);
  });

  /**
   * 在ctx中生成数据库连接
   * 数据库连接使用sequelize后移除
   */
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
})();

module.exports = app;
