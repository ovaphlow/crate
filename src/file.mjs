import fs from 'fs';
import path from 'path';

import FlakeId from 'flake-idgen';
import Router from '@koa/router';
import multer from '@koa/multer';

import {
  DATACENTER_ID, WORKER_ID, EPOCH,
} from './configuration.mjs';
import { pool } from './mysql.mjs';

export const router = new Router();

const upload = multer();

export const getFile = async (option, data) => {
  if (option === 'by-ref') {
    const client = pool.promise();
    const [result] = await client.execute(`
    select * from file where ref_id = ?
    `, [data.refId]);
    return result;
  }
  return [];
};

router.get('/api/miscellaneous/simple/file/:id', async (ctx) => {
  const { option } = ctx.request.query;
  if (option === 'by-ref') {
    const result = await getFile(option, { refId: parseInt(ctx.params.id, 10) });
    if (result.length === 1) {
      ctx.response.set('content-disposition', `attachment;filename=${result[0].id}.pdf`);
      ctx.response.body = fs.readFileSync(path.resolve('..', 'upload', `${result[0].id}.pdf`));
    } else ctx.response.status = 404;
  }
});

export const updateFile = async (data) => {
  const client = pool.promise();
  const [result] = await client.execute(`
  update file
  set detail = ?
  where ref_id = ? 
  `, [data.detail, data.ref_id]);
  return result;
};

export const saveFile = async (data) => {
  const client = pool.promise();
  const [result] = await client.execute(`
  insert into file (
      id, ref_id, tag, detail
  ) values (
      ?, ?, ?, ?
  )
  `, [data.id, data.ref_id, data.tag, data.detail]);
  return result;
};

router.post('/api/miscellaneous/simple/file', upload.single('resume'), async (ctx) => {
  const { refId } = ctx.request.body;
  const result = await getFile('by-ref', { refId: parseInt(refId, 10) });
  if (result.length === 0) {
    const flakeIdGen = new FlakeId({
      datacenter: DATACENTER_ID,
      worker: WORKER_ID,
      epoch: EPOCH,
    });
    const fid = flakeIdGen.next();
    await saveFile({
      id: fid.readBigInt64BE(0),
      ref_id: ctx.request.body.ref_id || 0,
      tag: ctx.request.body.tag || '[]',
      detail: JSON.stringify({
        ...JSON.parse(ctx.request.body.detail || '{}'),
        content: ctx.request.file.buffer,
      }),
    });
    ctx.response.status = 201;
  }
  if (result.length === 1) {
    fs.writeFileSync(path.resolve('..', 'upload', `${result[0].id}.pdf`), ctx.request.file.buffer);
    await updateFile({
      ref_id: result[0].ref_id,
      detail: JSON.stringify({
        ...JSON.parse(ctx.request.body.detail || '{}'),
        content: ctx.request.file.buffer.toString(),
      }),
    });
    ctx.response.status = 200;
  }
});
