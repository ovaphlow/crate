const Router = require('@koa/router');

const router = new Router({
  prefix: '/api/miscellaneous',
});

router.get('/setting', async (ctx) => {
  let option = ctx.request.query.option || '';
  if ('by-category' === option) {
    let sql = `
        select id
          , category
          , ref_id
          , ref_id2
          , detail->>'$.uuid' uuid
          , detail->>'$.name' name
        from setting
        where category = ?
        `;
    let [result] = await ctx.db_client.execute(sql, [ctx.request.query.category])
    ctx.response.body = result;
  } else if ('category' === option) {
    let sql = `
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
    let [result] = await ctx.db_client.execute(sql, [ctx.request.query.category]);
    ctx.response.body = result;
  }
});

module.exports = router;
