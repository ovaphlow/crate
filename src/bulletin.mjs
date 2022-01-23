import FlakeId from 'flake-idgen';
import JSONbig from 'json-bigint';
import Router from '@koa/router';

import {
  DATACENTER_ID, WORKER_ID, EPOCH,
} from './configuration.mjs';
import { pool } from './mysql.mjs';

export const router = new Router();

export const getBulletin = async (option, data) => {
  const client = pool.promise();
  if (option === '') {
    const [result] = await client.execute(`
    select * from bulletin order by id desc limit ${data.skip}, ${data.take}
    `, []);
    return result;
  }
  return [];
};

router.get('/api/bulletin/simple', async (ctx) => {
  const { option, take, skip } = ctx.request.query;
  const result = await getBulletin(option || '', {
    take: parseInt(take, 10) || 10,
    skip: parseInt(skip, 10) || 0,
  });
  ctx.response.body = JSONbig.stringify(result);
});

export const saveBulletin = async (data) => {
  const client = pool.promise();
  const sql = `
  insert into bulletin (id, category, title, publish_time, expire_at, detail, misc)
      values (?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await client.execute(sql, [
    data.id,
    data.category,
    data.title,
    data.publishTime,
    data.expireAt,
    data.detail || '{}',
    data.misc || '{}',
  ]);
  return result;
};

router.post('/api/bulletin/simple', async (ctx) => {
  const flakeIdGen = new FlakeId({
    datacenter: DATACENTER_ID,
    worker: WORKER_ID,
    epoch: EPOCH,
  });
  const fid = flakeIdGen.next();
  const { category, title, expireAt } = ctx.request.body;
  await saveBulletin({
    id: fid.readBigInt64BE(0),
    category,
    title,
    publishTime: new Date(),
    expireAt: new Date(expireAt),
    detail: '{}',
    misc: '{}',
  });
  ctx.response.status = 201;
});
