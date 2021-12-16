// const Router = require('@koa/router');
import Router from '@koa/router';

export const router = new Router({
  prefix: '/api/crate/single',
});

router.get('/setting', async (ctx) => {
  const option = ctx.request.query.option || '';
  if (option === 'by-category') {
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
    const [result] = await ctx.db_client.execute(sql, [ctx.request.query.category]);
    ctx.response.body = result;
  } else if (option === 'category') {
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
    const [result] = await ctx.db_client.execute(sql, [ctx.request.query.category]);
    ctx.response.body = result;
  }
});

// module.exports = router;
export default router;
