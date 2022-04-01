import Router from "@koa/router";

import { pool } from "./mysql.mjs";

export const router = new Router({
  prefix: "/api/crate/single",
});

router.get("/setting", async (ctx) => {
  const client = pool.promise();
  const option = ctx.request.query.option || "";
  if (option === "by-category") {
    const sql = `
    select id
        , category
        , ref_id
        , ref_id2
        , detail->>'$.uuid' uuid
        , detail->>'$.name' name
    from setting
    where category = ?
    `;
    const param = [ctx.request.query.category];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result;
  } else if (option === "category") {
    const sql = `
    select id
        , category
        , ref_id
        , ref_id2
        , detail->>'$.uuid' uuid
        , detail->>'$.name' name
    from setting
    where category = ?
        and ref_id = 0
    `;
    const param = [ctx.request.query.category];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result;
  }
});
