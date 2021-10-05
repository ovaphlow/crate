const Router = require('@koa/router');

const router = new Router({
  prefix: '/api/miscellaneous',
});

router.get('/favorite', async (ctx) => {
  let option = ctx.request.query.option || '';
  if ('ref_id-and-tag' === option) {
    let sql = `
        select
          id
          , ref_id
          , ref_id2 
          , dtime
          , detail->>'$.category' category
          , detail->>'$.tag' tag
          , detail->>'$.ref_uuid' ref_uuid
          , detail->>'$.ref_uuid2' ref_uuid2
        from favorite
        where ref_id = ?
          and detail->>'$.tag' = ?
        order by id desc
        limit 100
        `;
    let [result] = await ctx.db_client.query(sql, [ctx.request.query.id, ctx.request.query.tag]);
    ctx.response.body = result;
  }
});

module.exports = router;
