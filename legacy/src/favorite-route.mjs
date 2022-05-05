import Router from "@koa/router";

import { remove, filter } from "./favorite-repository.mjs";
import { pool } from "./mysql.mjs";

export const router = new Router({
  prefix: "/api/miscellaneous",
});

router.delete("/favorite/:id", async (ctx) => {
  const result = await remove({ id: parseInt(ctx.params.id || 0, 10) });
  ctx.response.body = result;
});

router.get("/favorite", async (ctx) => {
  const client = pool.promise();
  const option = ctx.request.query.option || "";
  if (option === "ref_id-and-tag") {
    const result = await filter(option, {
      ref_id: parseInt(ctx.request.query.id, 10),
      tag: ctx.request.query.tag,
    });
    ctx.response.body = result;
  } else if (option === "by-ref_id-category-tag") {
    const sql = `
    select id
        , ref_id
        , ref_id2
        , dtime
        , detail->>'$.category' category
        , detail->>'$.tag' tag
        , detail->>'$.ref_uuid' ref_uuid
        , detail->>'$.ref_uuid2' ref_uuid2
    from favorite
    where ref_id = ?
        and detail->>'$.category' = ?
        and detail->>'$.tag' = ?
    order by id desc
    limit 100
    `;
    const param = [
      parseInt(ctx.request.query.ref_id, 10),
      ctx.request.query.category,
      ctx.request.query.tag,
    ];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result;
  } else if (option === "by-ref_id-ref_id2-category-tag") {
    const sql = `
    select id
        , ref_id
        , ref_id2
        , dtime
        , detail->>'$.category' category
        , detail->>'$.tag' tag
        , detail->>'$.ref_uuid' ref_uuid
        , detail->>'$.ref_uuid2' ref_uuid2
    from favorite
    where ref_id = ?
        and ref_id2 = ?
        and detail->>'$.category' = ?
        and detail->>'$.tag' = ?
    `;
    const param = [
      parseInt(ctx.request.query.ref_id, 10),
      parseInt(ctx.request.query.ref_id2, 10),
      ctx.request.query.category,
      ctx.request.query.tag,
    ];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result;
  }
});

router.post("/favorite", async (ctx) => {
  const client = pool.promise();
  const sql = `
  insert into favorite (ref_id, ref_id2, dtime, detail)
  values(?, ?, now() , json_object('category', ?, 'tag', ?, 'ref_uuid', ?, 'ref_uuid2', ?))
  `;
  const param = [
    parseInt(ctx.request.body.ref_id || 0, 10),
    parseInt(ctx.request.body.ref_id2 || 0, 10),
    ctx.request.body.category,
    ctx.request.body.tag,
    ctx.request.body.ref_uuid,
    ctx.request.body.ref_uuid2,
  ];
  const [result] = await client.execute(sql, param);
  ctx.response.body = result;
});
