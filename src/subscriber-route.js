const crypto = require('crypto');

const Router = require('@koa/router');
const uuidv5 = require('uuid').v5;
const jose = require('jose');

const { PRIVATE_KEY, SECRET } = require('./configuration');
const repos = require('./subscriber-repos');

const router = new Router({
  prefix: '/api/miscellaneous',
});

router.post('/subscriber/sign-in', async (ctx) => {
  const { username } = ctx.request.body;
  const user = await repos.get('for-auth', { username });
  const { id } = user ?? { id: 0 };
  if (id > 0) {
    const hmac = crypto.createHmac('sha256', user.salt);
    const { password } = ctx.request.body;
    hmac.update(password);
    const passwordSalted = hmac.digest('hex');
    if (passwordSalted === user.password) {
      const privateKey = await jose.importPKCS8(PRIVATE_KEY);
      const jwt = await new jose.SignJWT({ id, username })
        .setProtectedHeader({ alg: 'ES256' })
        .setIssuedAt()
        .setIssuer('https://ovaphlow.io')
        .setAudience('ovaphlow:crate')
        .setExpirationTime('168h')
        .sign(privateKey);
      ctx.response.body = jwt;
    } else {
      ctx.response.status = 401;
    }
  } else {
    ctx.response.status = 401;
  }
});

router.post('/subscriber/sign-up', async (ctx) => {
  // eslint-disable-next-line
  const { username } = ctx.request.body;
  const result = await repos.filter('by-username', { username });
  if (result.length > 0) {
    ctx.response.status = 401;
    return;
  }
  const salt = crypto.randomBytes(8).toString('hex');
  const hmac = crypto.createHmac('sha256', salt);
  const { password } = ctx.request.body;
  hmac.update(password);
  const passwordSalted = hmac.digest('hex');
  const r = await repos.signUp({ username, password: passwordSalted, salt });
  ctx.response.body = r;
});

router.get('/subscriber/:id', async (ctx) => {
  const sql = `
      select
        id
        , username
        , detail->>'$.name' name
        , detail->>'$.uuid' uuid
      from subscriber
      where id = ?
        and detail->>'$.uuid' = ?
      `;
  const [result] = await ctx.db_client.query(sql, [
    parseInt(ctx.params.id, 10),
    ctx.request.query.uuid,
  ]);
  ctx.response.body = result.length === 1 ? result[0] : {};
});

router.put('/subscriber/:id', async (ctx) => {
  const sql = `
      update subscriber
      set username = ?
        , detail = json_set(detail
                            , '$.name', ?)
      where id = ?
        and detail->>'$.uuid' = ?
      `;
  const [result] = await ctx.db_client.query(sql, [
    ctx.request.body.username,
    ctx.request.body.name,
    parseInt(ctx.params.id, 10),
    ctx.request.query.uuid,
  ]);
  ctx.response.body = result;
});

router.delete('/subscriber/:id', async (ctx) => {
  const sql = `
      delete from subscriber
      where id = ?
        and detail->>'$.uuid' = ?
      `;
  const [result] = await ctx.db_client.query(sql, [
    parseInt(ctx.params.id, 10),
    ctx.request.query.uuid || '',
  ]);
  ctx.response.body = result;
});

router.get('/subscriber', async (ctx) => {
  const option = ctx.request.query.option || '';
  if (option === 'tag') {
    const sql = `
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
    const [result] = await ctx.db_client.query(sql, [ctx.request.query.tag]);
    ctx.response.body = result;
  } else ctx.response.body = [];
});

router.post('/subscriber', async (ctx) => {
  let sql = `
      select count(*) qty
      from subscriber
      where username = ?
      `;
  let [result] = await ctx.db_client.query(sql, [ctx.request.body.username]);
  if (result[0].qty !== 0) {
    ctx.response.status = 401;
    return;
  }
  sql = `
      insert
        into subscriber (username
                         , detail)
        values(?, ?)
      `;
  [result] = await ctx.db_client.query(sql, [
    ctx.request.body.username,
    JSON.stringify({
      uuid: uuidv5(ctx.request.body.username, Buffer.from(SECRET)),
      name: ctx.request.body.name,
      password: ctx.request.body.password,
      tag: ctx.request.body.tag,
    }),
  ]);
  ctx.response.body = result;
});

module.exports = router;
