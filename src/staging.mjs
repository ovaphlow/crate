import FlakeId from 'flake-idgen';
import Router from '@koa/router';

import { DATACENTER_ID, WORKER_ID, EPOCH } from './configuration.mjs';
import { pool } from './mysql.mjs';

export const router = new Router();

// http请求的处理函数
export const stagingEndpointGet = async (ctx) => {
  const { option } = ctx.request.query;
  if (option === 'filterBy-id') {
    const { id } = ctx.params;
    const result = await stagingRepositoryFilter(option, {
      id: parseInt(id, 10),
    });
    if (result.length) {
      const [row] = result;
      ctx.response.body = row;
    } else ctx.response.status = 404;
  }
  if (option === 'filterBy-tag') {
    const { tag, skip, take } = ctx.request.query;
    const result = await stagingRepositoryFilter(option, {
      skip: parseInt(skip, 10) || 0,
      take: parseInt(take, 10) || 10,
      tag,
    });
    ctx.response.body = result;
  }
};

// 查询数据
export const stagingRepositoryFilter = async (option, data) => {
  const client = pool.promise();
  if (option === 'filterBy-id') {
    const sql = `
    select *
    from staging
    where id = ?
    `;
    const param = [data.id];
    const [result] = await client.execute(sql, param);
    return result;
  }
  if (option === 'filterBy-tag') {
    const sql = `
    select *
    from staging
    where json_contains(tag, ?) = true
    order by id desc
    limit ${data.skip}, ${data.take}
    `;
    const param = [data.tag];
    const [result] = await client.execute(sql, param);
    return result;
  }
};
