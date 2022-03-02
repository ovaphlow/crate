import FlakeId from 'flake-idgen';
import JSONbig from 'json-bigint';
import Router from '@koa/router';

import { DATACENTER_ID, WORKER_ID, EPOCH } from './configuration.mjs';
import { pool } from './mysql.mjs';

export const router = new Router();

export const bulletinEndpointGet = async (ctx) => {
  const { id } = ctx.params;
  if (id) {
    const result = await bulletinRepositoryFilter('filterBy-id', {
      id: parseInt(id, 10),
    });
    if (result.length) {
      const [row] = result;
      ctx.response.body = row;
    } else ctx.response.status = 404;
  } else {
    const { option, skip, take } = ctx.request.query;
    const result = await bulletinRepositoryFilter(option || '', {
      take: parseInt(take, 10) || 10,
      skip: parseInt(skip, 10) || 0,
    });
    ctx.response.body = result;
  }
};

export const bulletinEndpointPost = async (ctx) => {
  const flakeIdGen = new FlakeId({
    datacenter: DATACENTER_ID,
    worker: WORKER_ID,
    epoch: EPOCH,
  });
  const fid = flakeIdGen.next();
  const { title, expireAt, tag, detail } = ctx.request.body;
  const result = await saveBulletin({
    id: fid.readBigInt64BE(0),
    title,
    publishTime: new Date(),
    expireAt: new Date(expireAt),
    tag,
    detail,
  });
  if (result.affectedRows === 1) ctx.response.status = 201;
  else ctx.response.status = 400;
};

export const bulletinRepositoryFilter = async (option, data) => {
  const client = pool.promise();
  if (option === '') {
    const sql = `
    select * from bulletin order by id desc limit ${data.skip}, ${data.take}
    `;
    const [result] = await client.execute(sql, []);
    return result;
  }
  if (option === 'filterBy-id') {
    const sql = `
    select * from bulletin where id = ?
    `;
    const param = [data.id];
    const [result] = await client.execute(sql, param);
    return result;
  }
  return [];
};

export const bulletinRepositorySave = async (data) => {
  const client = pool.promise();
  const sql = `
  insert into bulletin (id, title, publish_time, expire_at, tag, detail, misc)
      values (?, ?, ?, ?, ?, ?, ?)
  `;
  const param = [
    data.id,
    data.title,
    data.publishTime,
    data.expireAt,
    data.tag || '{}',
    data.detail || '{}',
    data.misc || '{}',
  ];
  const [result] = await client.execute(sql, param);
  return result;
};
