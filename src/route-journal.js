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
  } else if ('browse' === option) {
    let sql = `
        select
          id
          , ref_id common_user_id
          , ref_id2 data_id
          , dtime datime
          , detail->>'$.tag' category
          , detail->>'$.ref_uuid' common_user_uuid
          , detail->>'$.ref_uuid2' data_uuid
        from logbook
        where ref_id = ?
          and detail->>'$.ref_uuid' = ?
          and detail->>'$.category' = '浏览'
        order by id desc
        limit 100
        `;
    let [result] = await client.query(sql, [ctx.request.query.id, ctx.request.query.uuid]);
    ctx.response.body = result;
  } else if ('browse-by-date' === option) {
    let sql = `
        select
          id
          , ref_id common_user_id
          , ref_id2 data_id
          , dtime datime
          , detail->>'$.tag' category
          , detail->>'$.ref_uuid' common_user_uuid
          , detail->>'$.ref_uuid2' data_uuid
        from logbook
        where ref_id = ?
          and detail->>'$.ref_uuid' = ?
          and dtime between ? and ?
          and detail->>'$.category' = '浏览'
        `;
    let [result] = await client.query(sql, [
      ctx.request.query.id,
      ctx.request.query.uuid,
      ctx.request.query.date_begin,
      ctx.request.query.date_end,
    ]);
    ctx.response.body = result;
  } else if ('edit' === option) {
    let sql = `
        select
          id
          , ref_id user_id
          , ref_id2 data_id
          , dtime datime
          , detail->>'$.tag' category1
          , detail->>'$.category' category2
          , detail->>'$.ref_uuid2' data_uuid
          , detail->>'$.remark' remark
          , detail->>'$.ref_uuid' user_uuid
        from logbook
        where ref_id = ?
          and detail->>'$.category' = '编辑'
          and detail->>'$.ref_uuid' = ?
          and detail->>'$.tag' = '个人用户'
        order by id desc
        limit 100
        `;
    let [result] = await client.query(sql, [ctx.request.query.id, ctx.request.query.uuid]);
    ctx.response.body = result;
  } else if ('edit-by-date' === option) {
    let sql = `
        select
          id
          , ref_id user_id
          , ref_id2 data_id
          , dtime datime
          , detail->>'$.tag' category1
          , detail->>'$.category' category2
          , detail->>'$.ref_uuid2' data_uuid
          , detail->>'$.remark' remark
          , detail->>'$.ref_uuid' user_uuid
        from logbook
        where ref_id = ?
          and dtime between ? and ?
          and detail->>'$.tag' = '个人用户'
          and detail->>'$.category' = '编辑'
        `;
    let [result] = await client.query(sql, [
      ctx.request.query.id,
      ctx.request.query.date_begin,
      ctx.request.query.date_end,
    ]);
    ctx.response.body = result;
  } else if ('sign-in' === option) {
    let sql = `
        select
          id
          , dtime datime
          , ref_id user_id
          , detail->>'$.location' address
          , detail->>'$.tag' category
          , detail->>'$.ip' ip
        from logbook
        where ref_id = ?
          and detail->>'$.category' = '登录'
          and detail->>'$.tag' = ?
        order by id desc
        limit 100
        `;
    let [result] = await client.query(sql, [ctx.request.query.id, ctx.request.query.category]);
    ctx.response.body = result;
  } else if ('sign-in-by-date' === option) {
    let sql = `
        select
          id
          , ref_id user_id
          , dtime datime
          , detail->>'$.location' address
          , detail->>'$.tag' category
          , detail->>'$.ip' ip
        from logbook
        where ref_id = ?
          and dtime between ? and ?
          and detail->>'$.category' = '登录'
          and detail->>'$.tag' = ?
        order by id desc
        limit 100
        `;
    let [result] = await client.query(sql, [
      ctx.request.query.id,
      ctx.request.query.date_begin,
      ctx.request.query.date_end,
      ctx.request.query.category,
    ]);
    ctx.response.body = result;
  } else ctx.response.body = [];
});

module.exports = router;
