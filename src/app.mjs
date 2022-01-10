import { isMaster } from 'cluster';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import rewrite from 'koa-rewrite';

import { logger } from './winston.mjs';
import { pool } from './mysql.mjs';

export const app = new Koa();

(() => {
  if (isMaster) return;
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
    import('./captcha-route.mjs').then(({ router }) => {
      app.use(router.routes());
      app.use(router.allowedMethods());
    });
  })();

  (() => {
    import('./favorite-route.mjs').then(({ router }) => {
      app.use(router.routes());
      app.use(router.allowedMethods());
    });
  })();

  (() => {
    import('./feedback-route.mjs').then(({ router }) => {
      app.use(router.routes());
      app.use(router.allowedMethods());
    });
  })();

  (() => {
    import('./journal-route.mjs').then(({ router }) => {
      app.use(router.routes());
      app.use(router.allowedMethods());
    });
  })();

  (() => {
    import('./message-route.mjs').then(({ router }) => {
      app.use(router.routes());
      app.use(router.allowedMethods());
    });
  })();

  (() => {
    import('./setting-route.mjs').then(({ router }) => {
      app.use(router.routes());
      app.use(router.allowedMethods());
    });
  })();

  (() => {
    import('./subscriber-route.mjs').then(({ router }) => {
      app.use(router.routes());
      app.use(router.allowedMethods());
    });
  })();

  (() => {
    import('./bulletin-route.mjs').then(({ router }) => {
      app.use(router.routes());
      app.use(router.allowedMethods());
    });
  })();
})();
