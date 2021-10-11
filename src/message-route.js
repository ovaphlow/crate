const Router = require('@koa/router');

const router = new Router({
  prefix: '/api/miscellaneous',
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
    let [result] = await ctx.db_client.execute(sql, [
      ctx.request.body.status,
      parseInt(ctx.params.id, 10),
    ]);
    ctx.response.body = result;
  }
});

router.get('/message', async (ctx) => {
  let option = ctx.request.query.option || '';
  if ('by-ref_id2-category-tag-status' === option) {
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
          and detail->>'$.category' = ?
          and detail->>'$.tag' = ?
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
        limit 20
        `;
    let [result] = await ctx.db_client.execute(sql, [
      parseInt(ctx.request.query.ref_id2 || 0, 10),
      ctx.request.query.tag,
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
