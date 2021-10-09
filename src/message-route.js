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
  }
});

router.get('/message', async (ctx) => {
  let option = ctx.request.query.option || '';
  if ('ref_id2-and-tag' === option) {
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

module.exports = router;
