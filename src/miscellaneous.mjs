import FlakeId from 'flake-idgen';
// import JSONbig from 'json-bigint';
import Router from '@koa/router';

import {
  DATACENTER_ID, WORKER_ID, EPOCH,
} from './configuration.mjs';
import { pool } from './mysql.mjs';

export const router = new Router();

export const getMiscellaneous = async (option, data) => {
  if (option === 'by-id') {
    const client = pool.promise();
    const [result] = await client.execute(`
    select *
    from miscellaneous
    where id = ?
    `, [data.id]);
    return result;
  }
  if (option === 'by-tag') {
    const client = pool.promise();
    const [result] = await client.execute(`
    select *
    from miscellaneous
    where json_contains(tag, ?) = true
    order by id desc
    limit ${data.skip || 0}, ${data.take || 20}
    `, [data.tag]);
    return result;
  }
  return [];
};

router.get('/api/miscellaneous/simple/:id', async (ctx) => {
  const { id } = ctx.params;
  const result = await getMiscellaneous('by-id', { id: parseInt(id, 10) });
  if (result.length === 1) {
    const [row] = result;
    ctx.response.body = row;
  } else ctx.response.status = 404;
});

export const updateMiscellaneous = async (data) => {
  const client = pool.promise();
  const [result] = await client.execute(`
  update miscellaneous
  set ref_id = ?
      , ref2_id = ?
      , record_at = ?
      , tag = ?
      , detail = ?
  where id = ?
  `, [data.refId, data.ref2Id, data.recordAt, data.tag, data.detail, data.id]);
  return result;
};

router.put('/api/miscellaneous/simple/:id', async (ctx) => {
  const { id } = ctx.params;
  const {
    refId, ref2Id, recordAt, tag, detail,
  } = ctx.request.body;
  await updateMiscellaneous({
    refId: parseInt(refId, 10),
    ref2Id: parseInt(ref2Id, 10),
    recordAt,
    tag,
    detail,
    id: parseInt(id, 10),
  });
  ctx.response.status = 200;
});

export const removeMiscellaneous = async (data) => {
  const client = pool.promise();
  const [result] = await client.execute(`
  delete from miscellaneous where id = ?
  `, [data.id]);
  return result;
};

router.delete('/api/miscellaneous/simple/:id', async (ctx) => {
  const { id } = ctx.params;
  await removeMiscellaneous({ id: parseInt(id, 10) });
  ctx.response.status = 200;
});

router.get('/api/miscellaneous/simple', async (ctx) => {
  const { option } = ctx.request.query;
  if (option === 'by-tag') {
    const { tag } = ctx.request.query;
    const result = await getMiscellaneous(option, { tag });
    ctx.response.body = result;
  }
});

export const saveMiscellaneous = async (data) => {
  const client = pool.promise();
  const [result] = await client.execute(`
  insert into miscellaneous (id, ref_id, ref2_id, record_at, tag, detail)
      values (?, ?, ?, ?, ?, ?)
  `, [
    data.id,
    data.refId,
    data.ref2Id,
    data.recordAt,
    data.tag || '[]',
    data.detail || '{}',
  ]);
  return result;
};

router.post('/api/miscellaneous/simple', async (ctx) => {
  const flakeIdGen = new FlakeId({
    datacenter: DATACENTER_ID,
    worker: WORKER_ID,
    epoch: EPOCH,
  });
  const fid = flakeIdGen.next();
  const {
    refId, ref2Id, tag, detail,
  } = ctx.request.body;
  await saveMiscellaneous({
    id: fid.readBigInt64BE(0),
    refId,
    ref2Id,
    recordAt: new Date(),
    tag,
    detail,
  });
  ctx.response.status = 201;
});
