const Router = require('@koa/router');

const pool = require('./mysql');

const router = new Router({
  prefix: '/api/miscellaneous',
});

router.get('/journal', async (ctx) => {
  let option = ctx.request.query.option || '';
  let client = pool.promise();
  if ('ref_id-tag-date' === option) {
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
        from logbook
        where ref_id = ?
          and dtime between ? and ?
          and detail->>'$.tag' = ?
        order by id desc
        limit 100
        `;
    let [result] = await client.query(sql, [
      ctx.request.query.id,
      ctx.request.query.date_begin,
      ctx.request.query.date_end,
      ctx.request.query.tag,
    ]);
    ctx.response.body = result;
  } else ctx.response.body = [];
});

module.exports = router;
