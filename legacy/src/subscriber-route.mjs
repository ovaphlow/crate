import Router from "@koa/router";
import { v5 as uuidv5 } from "uuid";

import { SECRET } from "./configuration.mjs";
import { pool } from "./mysql.mjs";

export const router = new Router({
    prefix: "/api/miscellaneous",
});

router.get("/subscriber/:id", async (ctx) => {
    const client = pool.promise();
    const sql = `
    select id
        , username
        , detail->>'$.name' name
        , detail->>'$.uuid' uuid
    from subscriber
    where id = ?
        and detail->>'$.uuid' = ?
    `;
    const param = [parseInt(ctx.params.id, 10), ctx.request.query.uuid];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result.length === 1 ? result[0] : {};
});

router.put("/subscriber/:id", async (ctx) => {
    const client = pool.promise();
    const sql = `
    update subscriber
    set username = ?
        , detail = json_set(detail, '$.name', ?)
    where id = ?
        and detail->>'$.uuid' = ?
    `;
    const param = [
        ctx.request.body.username,
        ctx.request.body.name,
        parseInt(ctx.params.id, 10),
        ctx.request.query.uuid,
    ];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result;
});

router.delete("/subscriber/:id", async (ctx) => {
    const client = pool.promise();
    const sql = `
    delete from subscriber
    where id = ?  and detail->>'$.uuid' = ?
    `;
    const param = [parseInt(ctx.params.id, 10), ctx.request.query.uuid || ""];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result;
});

router.get("/subscriber", async (ctx) => {
    const client = pool.promise();
    const option = ctx.request.query.option || "";
    if (option === "tag") {
        const sql = `
        select id
            , username
            , detail->>'$.name' name
            , detail->>'$.uuid' uuid
        from subscriber
        where detail->>'$.tag' = ?
        order by id desc
        limit 20
        `;
        const param = [ctx.request.query.tag];
        const [result] = await client.execute(sql, param);
        ctx.response.body = result;
    } else ctx.response.body = [];
});

router.post("/subscriber", async (ctx) => {
    const client = pool.promise();
    let sql = `
    select count(*) qty from subscriber where username = ?
    `;
    let param = [ctx.request.body.username];
    let [result] = await client.execute(sql, param);
    if (result[0].qty !== 0) {
        ctx.response.status = 401;
        return;
    }
    sql = `
    insert into subscriber (username, detail) values(?, ?)
    `;
    param = [
        ctx.request.body.username,
        JSON.stringify({
            uuid: uuidv5(ctx.request.body.username, Buffer.from(SECRET)),
            name: ctx.request.body.name,
            password: ctx.request.body.password,
            tag: ctx.request.body.tag,
        }),
    ];
    [result] = await client.execute(sql, param);
    ctx.response.body = result;
});
