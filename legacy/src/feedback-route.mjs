import Router from "@koa/router";

import { saveMessage } from "./message-repository.mjs";
import { pool } from "./mysql.mjs";

export const router = new Router({
  prefix: "/api/miscellaneous",
});

router.put("/feedback/:id", async (ctx) => {
  const client = pool.promise();
  const option = ctx.request.query.option || "";
  if (option === "reply") {
    const result = saveMessage(option, {
      id: ctx.request.body.user_id,
      dtime: ctx.request.body.datime,
      detail: JSON.stringify({
        status: "未读",
        category: ctx.request.body.category,
        title: ctx.request.body.title,
        content: ctx.request.body.content,
        tag: ctx.request.body.user_category,
      }),
    });
    if (!result) {
      ctx.response.status = 500;
      return;
    }
    const sql = `
      update feedback
      set detail = json_set(detail, '$.status', '已处理')
      where id = ?
      `;
    const param = [parseInt(ctx.params.id, 10)];
    await client.execute(sql, param);
    ctx.response.status = 200;
  }
});

router.get("/feedback", async (ctx) => {
  const client = pool.promise();
  const option = ctx.request.query.option || "";
  if (option === "") {
    const sql = `
    select id
        , ref_id user_id
        , dtime datime
        , detail->>'$.category' category
        , detail->>'$.content' content
        , detail->>'$.status' status
        , detail->>'$.tag' user_category
        , detail->>'$.ref_uuid' user_uuid
    from feedback
    where detail->>'$.category' = ?
    order by id desc
    limit 100
    `;
    const param = [ctx.request.query.category];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result;
  } else if (option === "by-employer_id-and-tag") {
    const sql = `
    select id
        , ref_id
        , dtime
        , detail->>'$.category' category
        , detail->>'$.content' content
        , detail->>'$.status' status
        , detail->>'$.tag' tag
        , detail->>'$.ref_uuid' uuid
    from feedback
    where ref_id = ?
        and detail->>'$.tag' = ?
    order by id desc
    limit 10
    `;
    const param = [
      parseInt(ctx.request.query.id || 0, 10),
      ctx.request.query.tag || "",
    ];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result;
  } else if (option === "by-ref_id-tag") {
    const sql = `
    select id
        , ref_id
        , dtime
        , detail->>'$.category' category
        , detail->>'$.content' content
        , detail->>'$.status' status
        , detail->>'$.tag' tag
        , detail->>'$.ref_uuid' uuid
    from feedback
    where ref_id = ?
        and detail->>'$.tag' = ?
    order by id desc
    limit 20
    `;
    const param = [
      parseInt(ctx.request.query.ref_id, 10),
      ctx.request.query.tag || "",
    ];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result;
  }
});

router.post("/feedback", async (ctx) => {
  const client = pool.promise();
  const sql = `
  insert into
      feedback (ref_id, dtime, detail)
      values (?, ?, json_object("ref_uuid", ?, "category", ?, "tag", ?, "content", ?))
  `;
  const param = [
    ctx.request.body.user_id,
    ctx.request.body.datime,
    ctx.request.body.user_uuid,
    ctx.request.body.category,
    ctx.request.body.user_category,
    ctx.request.body.content,
  ];
  const [result] = await client.execute(sql, param);
  ctx.response.body = result;
});
