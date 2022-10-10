import FlakeId from "flake-idgen";
// import JSONbig from 'json-bigint';
import Router from "@koa/router";

import { DATACENTER_ID, WORKER_ID, EPOCH } from "./configuration.mjs";
import { pool } from "./mysql.mjs";

export const router = new Router();

export const miscellaneousEndpointGet = async (ctx) => {
  const { id } = ctx.params;
  if (id) {
    const result = await miscellaneousRepositoryFilter("filterBy-id", {
      id: parseInt(id, 10),
    });
    if (result.length) {
      const [row] = result;
      ctx.response.body = row;
    } else ctx.response.status = 404;
  } else {
    const { option, skip, take } = ctx.request.query;
    if (option === "filterBy-tag") {
      const { tag, skip, take } = ctx.request.query;
      const result = await miscellaneousRepositoryFilter(option, {
        tag,
        skip: parseInt(skip, 10) || 0,
        take: parseInt(take, 10) || 10,
      });
      ctx.response.body = result;
    }
    if (option === "filterBy-refId-tag") {
      const { refId, tag, skip, take } = ctx.request.query;
      const result = await miscellaneousRepositoryFilter(option, {
        refId: parseInt(refId, 10),
        tag,
        skip: parseInt(skip, 10) || 0,
        take: parseInt(take, 10) || 20,
      });
      ctx.response.body = result;
    }
    if (option === "filterBy-refId-ref2Id-tag") {
      const { refId, ref2Id, tag, skip, take } = ctx.request.query;
      const result = await miscellaneousRepositoryFilter(option, {
        refId: parseInt(refId, 10),
        ref2Id: parseInt(ref2Id, 10),
        tag,
        skip: parseInt(skip, 10) || 0,
        take: parseInt(take, 10) || 20,
      });
      ctx.response.body = result;
    }
  }
};

export const miscellaneousEndpointPost = async (ctx) => {
  const flakeIdGen = new FlakeId({
    datacenter: DATACENTER_ID,
    worker: WORKER_ID,
    epoch: EPOCH,
  });
  const fid = flakeIdGen.next();
  const { refId, ref2Id, tag, detail } = ctx.request.body;
  const result = await miscellaneousRepositorySave({
    id: fid.readBigInt64BE(0),
    refId,
    ref2Id,
    publishTime: new Date(),
    tag,
    detail,
  });
  if (result.affectedRows) ctx.response.status = 201;
  else ctx.response.status = 400;
};

export const miscellaneousEndpointPut = async (ctx) => {
  const { id } = ctx.params;
  const { refId, ref2Id, publishTime, tag, detail } = ctx.request.body;
  const result = await miscellaneousRepositoryUpdate({
    refId: parseInt(refId, 10),
    ref2Id: parseInt(ref2Id, 10),
    recordAt,
    tag,
    detail,
    id: parseInt(id, 10),
  });
  if (result.affectedRows) ctx.response.status = 200;
  else ctx.response.status = 404;
};

export const miscellaneousEndpointDelete = async (ctx) => {
  const { id } = ctx.params;
  const result = await miscellaneousRepositoryRemove({ id: parseInt(id, 10) });
  if (result.affectedRows) ctx.response.status = 200;
  else ctx.response.status = 404;
};

export const miscellaneousRepositoryFilter = async (option, data) => {
  if (option === "filterBy-id") {
    const client = pool.promise();
    const sql = `
        select *
        from miscellaneous
        where id = ?
        `;
    const param = [data.id];
    const [result] = await client.execute(sql, param);
    return result;
  }
  if (option === "filterBy-tag") {
    const client = pool.promise();
    const sql = `
        select *
        from miscellaneous
        where json_contains(tag, ?) = true
        order by id desc
        limit ${data.skip}, ${data.take}
        `;
    const param = [data.tag];
    const [result] = await client.execute(sql, param);
    return result;
  }
  if (option === "filterBy-refId-tag") {
    const client = pool.promise();
    const sql = `
        select *
        from miscellaneous
        where ref_id = ? and json_contains(tag, ?) = true
        order by id desc
        limit ${data.skip}, ${data.take}
        `;
    const param = [data.refId, data.tag];
    const [result] = await client.execute(sql, param);
    return result;
  }
  if (option === "filterBy-refId-ref2Id-tag") {
    const client = pool.promise();
    const sql = `
        select *
        from miscellaneous
        where ref_id = ? and ref2_id = ? and json_contains(tag, ?) = true
        order by id desc
        limit ${data.skip}, ${data.take}
        `;
    const param = [data.refId, data.ref2Id, data.tag];
    const [result] = await client.execute(sql, param);
    return result;
  }
  return [];
};

export const miscellaneousRepositoryUpdate = async (data) => {
  const client = pool.promise();
  const sql = `
    update miscellaneous
    set ref_id = ?
        , ref2_id = ?
        , publish_time = ?
        , tag = ?
        , detail = ?
    where id = ?
    `;
  const param = [
    data.refId,
    data.ref2Id,
    data.publishTime,
    data.tag,
    data.detail,
    data.id,
  ];
  const [result] = await client.execute(sql, param);
  return result;
};

export const miscellaneousRepositoryRemove = async (data) => {
  const client = pool.promise();
  const sql = "delete from miscellaneous where id = ?";
  const param = [data.id];
  const [result] = await client.execute(sql, param);
  return result;
};

export const miscellaneousRepositorySave = async (data) => {
  const client = pool.promise();
  const sql = `
    insert into
        miscellaneous (id, ref_id, ref2_id, publish_time, tag, detail)
        values (?, ?, ?, ?, ?, ?)
    `;
  const param = [
    data.id,
    data.refId,
    data.ref2Id,
    data.publishTime,
    data.tag || "[]",
    data.detail || "{}",
  ];
  const [result] = await client.execute(sql, param);
  return result;
};
