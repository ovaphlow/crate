const Router = require('@koa/router');

const router = new Router({
  prefix: '/api/miscellaneous',
});

router.get('/message/statistic', async (ctx) => {
  let option = ctx.request.query.option || '';
  if ('qty-by-ref_id2-category-tag-status' === option) {
    let sql = `
        select count(*) qty
        from message
        where ref_id2 = ?
          and position(? in detail->>'$.category') > 0
          and position(? in detail->>'$.tag') > 0
          and position(? in detail->>'$.status') > 0
        `;
    let [result] = await ctx.db_client.execute(sql, [
      parseInt(ctx.request.query.ref_id2, 10),
      ctx.request.query.category,
      ctx.request.query.tag,
      ctx.request.query.status,
    ]);
    ctx.response.body = result[0];
  }
});

router.get('/message/:id', async (ctx) => {
  let option = ctx.request.query.option || '';
  if ('qty-by-ref_id2-status' === option) {
    let sql = `
        select count(*) qty
        from message
        where ref_id2 = ?
          and detail->>'$.status' = ?
        `;
    let [result] = await ctx.db_client.execute(sql, [parseInt(ctx.request.params.id, 10), ctx.request.query.status]);
    ctx.response.body = result[0] || { qty: 0 };
  }
});

router.put('/message/:id', async (ctx) => {
  let option = ctx.request.query.option || '';
  if ('status-by-ref_id2-and-tag' === option) {
    let sql = `
        update message
        set detail = json_set(detail
                              , '$.status', ?)
        where ref_id2 = ?
          and detail->>'$.tag' = ?
        `;
    let [result] = await ctx.db_client.execute(sql, [
      ctx.request.body.status,
      parseInt(ctx.params.id || 0, 10),
      ctx.request.body.tag,
    ]);
    ctx.response.body = result;
  } else if ('status-by-id_list' === option) {
    let sql = `
        update message
        set detail = json_set(detail
                              , '$.status', ?)
        where ref_id2 = ?
          and id in (${ctx.request.body.id_list})
        `;
    let [result] = await ctx.db_client.execute(sql, [ctx.request.body.status, parseInt(ctx.params.id, 10)]);
    ctx.response.body = result;
  }
});

router.get('/message', async (ctx) => {
  let option = ctx.request.query.option || '';
  if ('by-ref_id2-tag' === option) {
    let sql = `
        select id
          , ref_id
          , ref_id2
          , dtime
          , detail->>'$.status' status
          , detail->>'$.category' category
          , detail->>'$.tag' tag
          , detail->>'$.title' title
          , detail->>'$.content' content
        from message
        where ref_id2 = ?
          and detail->>'$.tag' = ?
        order by id desc
        limit 100
        `;
    let [result] = await ctx.db_client.execute(sql, [parseInt(ctx.request.query.ref_id2, 10), ctx.request.query.tag]);
    ctx.response.body = result;
  } else if ('by-ref_id2-category-tag-status' === option) {
    let sql = `
        select id
          , ref_id
          , ref_id2
          , dtime
          , detail->>'$.status' status
          , detail->>'$.category' category
          , detail->>'$.tag' tag
          , detail->>'$.title' title
          , detail->>'$.content' content
        from message
        where ref_id2 = ?
          and position(? in detail->>'$.category') > 0
          and position(? in detail->>'$.tag') > 0
          and position(? in detail->>'$.status') > 0
        limit 100
        `;
    let [result] = await ctx.db_client.execute(sql, [
      parseInt(ctx.request.query.ref_id2, 10),
      ctx.request.query.category,
      ctx.request.query.tag,
      ctx.request.query.status,
    ]);
    ctx.response.body = result;
  } else if ('by-ref_id-ref_id2-category' === option) {
    let sql = `
        select id
          , ref_id
          , ref_id2
          , dtime
          , detail->>'$.status' status
          , detail->>'$.category' category
          , detail->>'$.tag' tag
          , detail->>'$.title' title
          , detail->>'$.content' content
        from message
        where (ref_id = ?
               and ref_id2 = ?
               and detail->'$.tag' = '企业用户'
               and detail->'$.category' = ?)
          or (ref_id = ?
              and ref_id2 = ?
              and detail->'$.tag' = '个人用户'
              and detail->'$.category' = ?)
        order by id
        limit 100
        `;
    let [result] = await ctx.db_client.execute(sql, [
      parseInt(ctx.request.query.ref_id2, 10),
      parseInt(ctx.request.query.ref_id, 10),
      ctx.request.query.category,
      parseInt(ctx.request.query.ref_id, 10),
      parseInt(ctx.request.query.ref_id2, 10),
      ctx.request.query.category,
    ]);
    ctx.response.body = result;
  } else if ('ref_id2-and-tag' === option) {
    let sql = `
        select id
          , ref_id
          , ref_id2
          , dtime
          , detail->>'$.status' status
          , detail->>'$.category' category
          , detail->>'$.tag' tag
          , detail->>'$.title' title
          , detail->>'$.content' content
        from message
        where ref_id2 = ?
          and detail->>'$.tag' = ?
        order by id desc
        limit 100
        `;
    let [result] = await ctx.db_client.execute(sql, [
      parseInt(ctx.request.query.ref_id2 || 0, 10),
      ctx.request.query.tag,
    ]);
    ctx.response.body = result;
  } else if ('group-ref_id-by-ref_id2-tag-category-status' === option) {
    // 指定接收方的已读/未读消息，按发送方分组，用于列表页
    let sql = `
    select ref_id, ref_id2, detail->>'$.tag' tag, detail->>'$.status' status, max(id) id
      , (select dtime from ovaphlow.message t2 where t2.id = max(t.id)) dtime
    from ovaphlow.message t
    where ref_id2 = ? and detail->>'$.tag' = ?
      and detail->>'$.category' = ?
      and detail->>'$.status' = ?
    group by ref_id
    `;
    let [result] = await ctx.db_client.execute(sql, [
      parseInt(ctx.request.query.ref_id2 || 0, 10),
      ctx.request.query.tag,
      ctx.request.query.category,
      ctx.request.query.status,
    ]);
    ctx.response.body = result;
  } else if ('group-ref_id-by-ref_id2-tag-category-exclude_list' === option) {
    // 指定接收方的已读未回消息(排除指定接收方的未读消息的ref_id)，按发送方分组，用于列表页
    let sql = `
    select ref_id, ref_id2, detail->>'$.tag' tag, detail->>'$.status' status
      , max(id) id
      , (select dtime from ovaphlow.message t2 where t2.id = max(t.id)) dtime
    from ovaphlow.message t
    where ref_id2 = ? and detail->>'$.tag' = ?
      and detail->>'$.category' = ?
      and ref_id not in (${ctx.request.query.list})
    group by ref_id
    order by dtime desc
    limit 100
    `;
    let [result] = await ctx.db_client.execute(sql, [
      parseInt(ctx.request.query.ref_id2 || 0, 10),
      ctx.request.query.tag,
      ctx.request.query.category,
    ]);
    ctx.response.body = result;
  } else if ('group-ref_id2-by-ref_id-tag-category-exclude_list' === option) {
    // 指定发送方的消息（排除指定接收方的ref_id列表），按接收方分组，用于列表页
    let sql = `
    select ref_id, ref_id2, detail->>'$.tag' tag, detail->>'$.status' status
      , max(id) id
      , (select dtime from ovaphlow.message t2 where t2.id = max(t.id)) dtime
    from ovaphlow.message t
    where ref_id = ? and detail->>'$.tag' = ?
      and detail->>'$.category' = ?
      and ref_id2 not in (${ctx.request.query.list})
    group by ref_id2
    order by dtime desc
    limit 100
    `;
    let [result] = await ctx.db_client.execute(sql, [
      parseInt(ctx.request.query.ref_id || 0, 10),
      ctx.request.query.tag,
      ctx.request.query.category,
    ]);
    ctx.response.body = result;
  }
});

router.post('/message', async (ctx) => {
  let sql = `
      insert into message (ref_id
                           , ref_id2
                           , dtime
                           , detail)
      values(?
             , ?
             , ?
             , json_object('status', '未读'
                           , 'category', ?
                           , 'tag', ?
                           , 'content', ?))
      `;
  let [result] = await ctx.db_client.execute(sql, [
    ctx.request.body.ref_id,
    ctx.request.body.ref_id2,
    ctx.request.body.dtime,
    ctx.request.body.category,
    ctx.request.body.tag,
    ctx.request.body.content,
  ]);
  ctx.response.body = result;
});

module.exports = router;
