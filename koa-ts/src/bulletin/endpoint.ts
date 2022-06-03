import dayjs from "dayjs";
import FlakeId from "flake-idgen";
import { Context } from "koa";
import { v4 as uuidv4 } from "uuid";
import { filter, filterByIdUuid, filterByTag, remove, save, update } from "./repository";

export const endpointDelete = async (ctx: Context) => {
    const { id } = ctx.params;
    const result = await remove(id);
    if (result.affectedRows === 0) ctx.response.status = 400;
    else ctx.response.status = 200;
};

export const get = async (ctx: Context) => {
    const { option } = ctx.request.query;
    if (option?.toString() || "" === "") {
        const { take, skip } = ctx.request.query;
        const result = await filter(take?.toString() || "10", skip?.toString() || "0");
        ctx.response.body = result;
    }
    if (option === "filterBy-tag") {
        const { tag, take, skip } = ctx.request.query;
        const result = await filterByTag(
            tag?.toString() || "[]",
            take?.toString() || "10",
            skip?.toString() || "0"
        );
        ctx.response.body = result;
    }
};

export const getWithResourceId = async (ctx: Context) => {
    const { id, uuid } = ctx.params;
    const result = await filterByIdUuid(id, JSON.stringify({ uuid }));
    if (result.length > 0) ctx.response.body = result[0];
};

export const post = async (ctx: Context) => {
    const flakeIdGen = new FlakeId({
        datacenter: 14,
        worker: 14,
        epoch: 1288834974657,
    });
    const result = await save(
        flakeIdGen.next().readBigInt64BE(0).toString(),
        ctx.request.body.title,
        ctx.request.body.publishTime || dayjs().format("YYYY-MM-DD HH:mm:ss"),
        ctx.request.body.expireAt || dayjs().format("YYYY-MM-DD HH:mm:ss"),
        ctx.request.body.tag,
        JSON.stringify(Object.assign(JSON.parse(ctx.request.body.detail), { uuid: uuidv4() }))
    );
    if (result.affectedRows === 0) ctx.response.status = 400;
    else ctx.response.status = 201;
};

export const put = async (ctx: Context) => {
    const { id, uuid } = ctx.params;
    const rows = await filterByIdUuid(id, JSON.stringify({ uuid }));
    if (rows.length === 0) {
        ctx.response.status = 404;
        return;
    }
    const [row] = rows;
    const data = { ...row, ...ctx.request.body };
    const result = await update(
        id,
        data.title,
        data.publish_time,
        data.expire_at,
        data.tag,
        data.detail
    );
    if (result.affectedRows === 0) ctx.response.status = 400;
    else ctx.response.status = 200;
};
