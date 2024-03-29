import Router from "@koa/router";
import { pool } from "../mysql.mjs";

export const router = new Router({
  prefix: "/api",
});

router.get("/miscellaneous/journal", async (ctx) => {
  const client = pool.promise();
  const option = ctx.request.query.option || "";
  if (option === "by-ref_id-tag") {
    const sql = `
        select id
            , ref_id
            , ref_id2
            , dtime
            , detail->>'$.category' category
            , detail->>'$.tag' tag
            , detail->>'$.ref_uuid' ref_uuid
            , detail->>'$.ref_uuid2' ref_uuid2
            , detail->>'$.ip' ip
        from logbook
        where ref_id = ?
            and detail->>'$.tag' = ?
        order by id desc
        limit 10
        `;
    const param = [
      parseInt(ctx.request.query.ref_id || 0, 10),
      ctx.request.query.tag || "",
    ];
    const [result] = await client.execute(sql, param);
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
            , detail->>'$.ip' ip
        from logbook
        where ref_id = ?
            and position(? in detail->>'$.category') > 0
            and detail->>'$.tag' = ?
        order by id desc
        limit 20
        `;
    const param = [
      parseInt(ctx.request.query.ref_id, 10),
      ctx.request.query.category || "",
      ctx.request.query.tag || "",
    ];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result;
  } else if (option === "ref_id-tag-date") {
    const sql = `
        select id
            , ref_id
            , ref_id2
            , dtime
            , detail->>'$.category' category
            , detail->>'$.tag' tag
            , detail->>'$.ref_uuid' ref_uuid
            , detail->>'$.ref_uuid2' ref_uuid2
        from logbook
        where ref_id = ?
            and dtime between ? and ?
            and position(? in detail->>'$.tag') > 0
        order by id desc
        limit 100
        `;
    const param = [
      ctx.request.query.id,
      ctx.request.query.date_begin,
      ctx.request.query.date_end,
      ctx.request.query.tag,
    ];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result;
  } else ctx.response.body = [];
});

router.post("/miscellaneous/journal", async (ctx) => {
  const client = pool.promise();
  const sql = `
    insert into
        logbook (ref_id, ref_id2, dtime, detail)
        values(?, ?, now(), json_object('category', ?, 'tag', ?, 'ref_uuid', ?, 'ref_uuid2', ?))
    `;
  const param = [
    ctx.request.body.ref_id,
    ctx.request.body.ref_id2,
    ctx.request.body.category,
    ctx.request.body.tag,
    ctx.request.body.ref_uuid,
    ctx.request.body.ref_uuid2,
  ];
  const [result] = await client.execute(sql, param);
  ctx.response.body = result;
});
