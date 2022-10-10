import { DATACENTER_ID, WORKER_ID, EPOCH } from "../configuration.mjs";
import { filter, save } from "./repository.mjs";
import { v4 as uuid } from "uuid";
import FlakeId from "flake-idgen";
import { convertArray2Object } from "../utility/convertArray2Object.mjs";

export const endpointGet = async (ctx) => {
  const { id } = ctx.params;
  if (id) {
    const { uuid } = ctx.params;
    if (!uuid) {
      ctx.response.status = 400;
      return;
    }
    const result = await filter("filterBy-id", { id, uuid });
    const [row] = result;
    ctx.response.body = row || { id: 0 };
    return;
  }
  const { option } = ctx.request.query;
  if (option === "filterBy-publishedAtRange-detail") {
    const { time, time1, detail, take, skip } = ctx.request.query;
    if (!time || !time1 || !detail) {
      ctx.response.status = 400;
      return;
    }
    if (detail.split(",").length % 2 !== 0) {
      ctx.response.status = 400;
      return;
    }
    const result = await filter(option, {
      time,
      time1,
      detail: JSON.stringify(convertArray2Object(detail.split(","))),
      take: take || 10,
      skip: skip || 0,
    });
    ctx.response.body = result;
    return;
  }
  ctx.response.status = 412;
};

export const endpointPost = async (ctx) => {
  const flakeIdGen = new FlakeId({
    datacenter: DATACENTER_ID,
    worker: WORKER_ID,
    epoch: EPOCH,
  });
  const fid = flakeIdGen.next();
  const { title, expiredAt, tag } = ctx.request.body;
  if (!title || !expiredAt || !tag) {
    ctx.response.status = 400;
    return;
  }
  const detail = JSON.parse(ctx.request.body["detail"]);
  if (!detail) {
    ctx.response.status = 400;
    return;
  }
  detail["uuid"] = uuid();
  const result = await save({
    id: fid.readBigInt64BE(0).toString(),
    title,
    expiredAt,
    tag,
    detail: JSON.stringify(detail),
  });
  if (result.affectedRows > 0) ctx.response.status = 201;
  else ctx.response.status = 400;
};
