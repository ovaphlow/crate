import FlakeId from "flake-idgen";

import { DATACENTER_ID, WORKER_ID, EPOCH } from "../configuration.mjs";
import {
    bulletinRepositoryFilter,
    bulletinRepositoryUpdate,
    bulletinRepositoryRemove,
    bulletinRepositorySave,
} from "./bulletin-repository.mjs";

export const bulletinEndpointGet = async (ctx) => {
    const { id } = ctx.params;
    if (id) {
        const result = await bulletinRepositoryFilter("filterBy-id", { id });
        if (result.length) {
            const [row] = result;
            ctx.response.body = row;
        } else ctx.response.status = 404;
    } else {
        const { option } = ctx.request.query;
        if (option === "") {
            const { skip, take } = ctx.request.query;
            const result = await bulletinRepositoryFilter(option || "", {
                take: parseInt(take, 10) || 10,
                skip: parseInt(skip, 10) || 0,
            });
            ctx.response.body = result;
        }
        if (option === "filterBy-tag") {
            const { tag, skip, take } = ctx.request.query;
            const result = await bulletinRepositoryFilter(option, {
                tag,
                skip: parseInt(skip, 10) || 0,
                take: parseInt(take, 10) || 10,
            });
            ctx.response.body = result;
        }
        if (option === "filterBy-tag-detail") {
            const { tag, detail, skip, take } = ctx.request.query;
            const result = await bulletinRepositoryFilter(option, {
                tag,
                detail,
                skip: parseInt(skip, 10) || 0,
                take: parseInt(take, 10) || 10,
            });
            ctx.response.body = result;
        }
        if (option === "statsBy-today-total") {
            const { tag } = ctx.request.query;
            const result = await bulletinRepositoryFilter(option, {
                tag,
                date: dayjs().format("YYYY-MM-DD"),
            });
            const [row] = result;
            ctx.response.body = row;
        }
    }
};

export const bulletinEndpointPut = async (ctx) => {
    const { id } = ctx.params;
    const result = await bulletinRepositoryUpdate({
        ...ctx.request.body,
        id,
    });
    if (result.affectedRows === 1) {
        ctx.response.status = 200;
    } else ctx.response.status = 400;
};

export const bulletinEndpointDelete = async (ctx) => {
    const { id } = ctx.params;
    const result = await bulletinRepositoryRemove({ id });
    if (result.affectedRows === 1) {
        ctx.response.status = 200;
    } else ctx.response.status = 404;
};

export const bulletinEndpointPost = async (ctx) => {
    const flakeIdGen = new FlakeId({
        datacenter: DATACENTER_ID,
        worker: WORKER_ID,
        epoch: EPOCH,
    });
    const fid = flakeIdGen.next();
    const { title, publishTime, expireAt, tag, detail } = ctx.request.body;
    const result = await bulletinRepositorySave({
        id: fid.readBigInt64BE(0),
        title,
        publishTime: publishTime || new Date(),
        expireAt: new Date(expireAt),
        tag,
        detail,
    });
    if (result.affectedRows === 1) ctx.response.status = 201;
    else ctx.response.status = 400;
};
