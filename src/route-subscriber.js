const Router = require('@koa/router');
const uuidv5 = require('uuid').v5;

const pool = require('./mysql');

const router = new Router({
  prefix: '/api/miscellaneous',
});

router.get('/subscriber/:id', async (ctx) => {
  let client = pool.promise();
  let sql = `
      select
        id
        , username
        , detail->>'$.name' name
        , detail->>'$.uuid' uuid
      from subscriber
      where id = ?
        and detail->>'$.uuid' = ?
      `;
  let [result] = await client.query(sql, [parseInt(ctx.params.id, 10), ctx.request.query.uuid]);
  ctx.response.body = result.length === 1 ? result[0] : {};
});

router.put('/subscriber/:id', async (ctx) => {
  let client = pool.promise();
  let sql = `
      update subscriber
      set username = ?
        , detail = json_set(detail
                            , '$.name', ?)
      where id = ?
        and detail->>'$.uuid' = ?
      `;
  let [result] = await client.query(sql, [
    ctx.request.body.username,
    ctx.request.body.name,
    parseInt(ctx.params.id, 10),
    ctx.request.query.uuid,
  ]);
  ctx.response.body = result;
});

router.get('/subscriber', async (ctx) => {
  let client = pool.promise();
  let option = ctx.request.query.option || '';
  if ('tag' === option) {
    let sql = `
        select
          id
          , username
          , detail->>'$.name' name
          , detail->>'$.uuid' uuid
        from subscriber
        where detail->>'$.tag' = ?
        order by id desc
        limit 20
        `;
    let [result] = await client.query(sql, [ctx.request.query.tag]);
    ctx.response.body = result;
  } else ctx.response.body = [];
});

router.post('/subscriber', async (ctx) => {
  let uuid = uuidv5('1234', '4531f7b0-250a-11ec-9621-0242ac130002');
  let client = pool.promise();
  let sql = `
      insert
        into subscriber (username
                         , detail)
        values(?, ?)
      `;
  ctx.response.status = 200;
});

module.exports = router;
