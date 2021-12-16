// @flow
const cluster = require('cluster');
// import { isMaster } from 'cluster';

const Koa = require('koa');
// import Koa from 'koa';
const bodyParser = require('koa-bodyparser');
// import bodyParser from 'koa-bodyparser';
const rewrite = require('koa-rewrite');
// import rewrite from 'koa-rewrite';

const logger = require('./winston');
// import logger from './winston';
const pool = require('./mysql');
// import pool from './mysql';

const app /*: any */ = new Koa();

(() => {
  if (cluster.isMaster) return;
  // if (isMaster) return;

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
    // import('./captcha-route').then((router) => {
    //   app.use(router.routes());
    //   app.use(router.allowedMethods());
    // });
  })();

  (() => {
    const router = require('./favorite-route');
    app.use(router.routes());
    app.use(router.allowedMethods());
    // import('./favorite-route').then((router) => {
    //   app.use(router.routes());
    //   app.use(router.allowedMethods());
    // });
  })();

  (() => {
    const router = require('./feedback-route');
    app.use(router.routes());
    app.use(router.allowedMethods());
    // import('./feedback-route').then((router) => {
    //   app.use(router.routes());
    //   app.use(router.allowedMethods());
    // });
  })();

  (() => {
    const router = require('./journal-route');
    app.use(router.routes());
    app.use(router.allowedMethods());
    // import('./journal-route').then((router) => {
    //   app.use(router.routes());
    //   app.use(router.allowedMethods());
    // });
  })();

  (() => {
    const router = require('./message-route');
    app.use(router.routes());
    app.use(router.allowedMethods());
    // import('./message-route').then((router) => {
    //   app.use(router.routes());
    //   app.use(router.allowedMethods());
    // });
  })();

  (() => {
    const router = require('./setting-route');
    app.use(router.routes());
    app.use(router.allowedMethods());
    // import('./setting-route').then((router) => {
    //   app.use(router.routes());
    //   app.use(router.allowedMethods());
    // });
  })();

  (() => {
    const router = require('./subscriber-route');
    app.use(router.routes());
    app.use(router.allowedMethods());
    // import('./subscriber-route').then((router) => {
    //   app.use(router.routes());
    //   app.use(router.allowedMethods());
    // });
  })();
})();

module.exports = app;
// export default app;
