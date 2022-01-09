import FlakeId from 'flake-idgen';
import JSONbig from 'json-bigint';
import Router from '@koa/router';

import {
  DATACENTER_ID, WORKER_ID, EPOCH,
} from './configuration.mjs';
import * as bulletin from './bulletin.mjs';

export const router = new Router({
  prefix: '/api/miscellaneous',
});

// curl localhost:8421/api/miscellaneous/bulletin
router.get('/bulletin', async (ctx) => {
  const { option, take, skip } = ctx.request.query;
  const result = await bulletin.get(option || '', {
    take: parseInt(take, 10) || 10,
    skip: parseInt(skip, 10) || 0,
  });
  ctx.response.body = JSONbig.stringify(result);
});

// eslint-disable-next-line
// curl -X POST -d 'category=cat' -d 'title=sa' -d 'expireTime=2022-01-09 12:34:56' localhost:8421/api/miscellaneous/bulletin
router.post('/bulletin', async (ctx) => {
  const flakeIdGen = new FlakeId({
    datacenter: DATACENTER_ID,
    worker: WORKER_ID,
    epoch: EPOCH,
  });
  const fid = flakeIdGen.next();
  const { category, title, expireTime } = ctx.request.body;
  await bulletin.save({
    id: fid.readBigInt64BE(0),
    category,
    title,
    record_time: new Date(),
    expire_time: new Date(expireTime),
    detail: '{}',
    misc: '{}',
  });
  ctx.response.status = 201;
});
