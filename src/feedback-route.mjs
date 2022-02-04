import Router from '@koa/router';

import { pool } from './mysql.mjs';

export const router = new Router({
  prefix: '/api/miscellaneous',
});

router.put('/feedback/:id', async (ctx) => {
  import('./message-repository.mjs').then(async ({ messageRepository }) => {
    const client = pool.promise();
    const option = ctx.request.query.option || '';
    if (option === 'reply') {
      const result = messageRepository.save(option, {
        id: ctx.request.body.user_id,
        dtime: ctx.request.body.datime,
        detail: JSON.stringify({
          status: '未读',
          category: ctx.request.body.category,
          title: ctx.request.body.title,
          content: ctx.request.body.content,
          tag: ctx.request.body.user_category,
        }),
      });
      if (!result) {
        ctx.response.status = 500;
        return;
      }
      await client.execute(`
      update feedback
      set detail = json_set(detail, '$.status', '已处理')
      where id = ?
      `, [parseInt(ctx.params.id, 10)]);
      ctx.response.status = 200;
    }
  });
});

router.get('/feedback', async (ctx) => {
  const client = pool.promise();
  const option = ctx.request.query.option || '';
  if (option === '') {
    const [result] = await client.execute(`
    select id
        , ref_id user_id
        , dtime datime
        , detail->>'$.category' category
        , detail->>'$.content' content
        , detail->>'$.status' status
        , detail->>'$.tag' user_category
        , detail->>'$.ref_uuid' user_uuid
    from feedback
    where detail->>'$.category' = ?
    order by id desc
    limit 100
    `, [ctx.request.query.category]);
    ctx.response.body = result;
  } else if (option === 'by-employer_id-and-tag') {
    const [result] = await client.execute(`
    select id
        , ref_id
        , dtime
        , detail->>'$.category' category
        , detail->>'$.content' content
        , detail->>'$.status' status
        , detail->>'$.tag' tag
        , detail->>'$.ref_uuid' uuid
    from feedback
    where ref_id = ?
        and detail->>'$.tag' = ?
    order by id desc
    limit 10
    `, [
      parseInt(ctx.request.query.id || 0, 10),
      ctx.request.query.tag || '',
    ]);
    ctx.response.body = result;
  } else if (option === 'by-ref_id-tag') {
    const [result] = await client.execute(`
    select id
        , ref_id
        , dtime
        , detail->>'$.category' category
        , detail->>'$.content' content
        , detail->>'$.status' status
        , detail->>'$.tag' tag
        , detail->>'$.ref_uuid' uuid
    from feedback
    where ref_id = ?
        and detail->>'$.tag' = ?
    order by id desc
    limit 20
    `, [
      parseInt(ctx.request.query.ref_id, 10),
      ctx.request.query.tag || '',
    ]);
    ctx.response.body = result;
  }
});

router.post('/feedback', async (ctx) => {
  const client = pool.promise();
  const [result] = await client.execute(`
  insert into feedback (ref_id, dtime, detail)
    values(?, ?, json_object("ref_uuid", ?, "category", ?, "tag", ?, "content", ?))
  `, [
    ctx.request.body.user_id,
    ctx.request.body.datime,
    ctx.request.body.user_uuid,
    ctx.request.body.category,
    ctx.request.body.user_category,
    ctx.request.body.content,
  ]);
  ctx.response.body = result;
});
