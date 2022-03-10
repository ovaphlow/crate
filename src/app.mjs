import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import helmet from 'koa-helmet';
import koaLogger from 'koa-logger';
import rewrite from 'koa-rewrite';
import Router from '@koa/router';

import { logger } from './winston.mjs';
import { bulletinEndpointGet, bulletinEndpointPost, bulletinEndpointPut } from './bulletin/bulletin-endpoint.mjs';
import {
  miscellaneousEndpointGet,
  miscellaneousEndpointPut,
  miscellaneousEndpointPost,
  miscellaneousEndpointDelete,
} from './miscellaneous.mjs';
import { stagingEndpointGet } from './staging.mjs';

export const app = new Koa();

app.use(helmet());

app.use(bodyParser({ jsonLimit: '16mb' }));

app.use(
  rewrite(/^\/api\/miscellaneous\/setting(.*)/, '/api/crate/single/setting$1'),
);

// eslint-disable-next-line
app.use(
  koaLogger((str, args) => {
    logger.debug(str);
  }),
);

// app.use(async (ctx, next) => {
//   logger.info(`--> ${ctx.request.method} ${ctx.request.url}`);
//   await next();
//   logger.info(`<-- ${ctx.request.method} ${ctx.request.url}`);
// });

app.on('error', (err, ctx) => {
  logger.error(`${ctx.req.method} ${ctx.req.url}`);
  logger.error(err.stack);
});

(() => {
  import('./captcha-route.mjs').then(({ router }) => {
    logger.info('加载 captcha ...');
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

(() => {
  import('./favorite-route.mjs').then(({ router }) => {
    logger.info('加载 favorite ...');
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

(() => {
  import('./feedback-route.mjs').then(({ router }) => {
    logger.info('加载 feedback ...');
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

(() => {
  import('./file.mjs').then(({ router }) => {
    logger.info('加载 file ...');
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

(() => {
  import('./journal-route.mjs').then(({ router }) => {
    logger.info('加载 journal ...');
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

(() => {
  import('./message-route.mjs').then(({ router }) => {
    logger.info('加载 message ...');
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

(() => {
  import('./setting-route.mjs').then(({ router }) => {
    logger.info('加载 setting ...');
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

(() => {
  import('./subscriber-route.mjs').then(({ router }) => {
    logger.info('加载 subscriber ...');
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

const router = new Router({
  prefix: '/api',
});

(() => {
  // bulletin
  router.get('/simple/bulletin/:id', bulletinEndpointGet);
  router.put('/simple/bulletin/:id', bulletinEndpointPut);
  router.get('/simple/bulletin', bulletinEndpointGet);
  router.post('/simple/bulletin', bulletinEndpointPost);
})();

(() => {
  // miscellaneous
  // favorite, feedback, file, journal, message, setting
  router.get('/simple/miscellaneous/:id', miscellaneousEndpointGet);
  router.put('/simple/miscellaneous/:id', miscellaneousEndpointPut);
  router.delete('/simple/miscellaneous/:id', miscellaneousEndpointDelete);
  router.get('/simple/miscellaneous', miscellaneousEndpointGet);
  router.post('/simple/miscellaneous', miscellaneousEndpointPost);
})();

(() => {
  // staging
  // captcha
  router.get('/simple/staging/:id', stagingEndpointGet);
  router.get('/simple/staging', stagingEndpointGet);
})();

app.use(router.routes());
app.use(router.allowedMethods());
