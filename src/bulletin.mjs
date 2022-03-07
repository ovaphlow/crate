import dayjs from 'dayjs';
import FlakeId from 'flake-idgen';

import { DATACENTER_ID, WORKER_ID, EPOCH } from './configuration.mjs';
import { pool } from './mysql.mjs';

/*
-- banner
insert into ovaphlow.bulletin (title, publish_time, expire_at, tag, detail, misc)
    select title, datime, datime, json_array("banner", category), json_object("status", status, "comment", comment, "data_url", data_url, "source_url", source_url), '{}'
    from billboard.banner;
*/

/*
-- recommend !!!
insert into ovaphlow.bulletin (title, publish_time, expire_at, tag, detail, misc)
    select title, date1, date2
        , json_array("推荐信息", category)
        , json_object("address_level1", address_level1,
                      "address_level2", address_level2,
                      "publisher", publisher,
                      "qty", qty,
                      "baomingfangshi", baomignfangshi,
                      "content", content)
        , '{}'
    from billboard.recommend;
*/

/*
-- campus
insert into ovaphlow.bulletin (title, publish_time, expire_at, tag, detail, misc)
    select title, concat(date, " ", time), concat(date, " ", time)
        , json_array("校园招聘", category)
        , json_object("address_level1", address_level1
                , "address_level2", address_level2
                , "address_level3", address_level3
                , "address_level4", address_level4
                , "school", school
                , "content", content)
        , '{}'
    from billboard.campus;
*/

export const bulletinEndpointGet = async (ctx) => {
  const { id } = ctx.params;
  if (id) {
    const result = await bulletinRepositoryFilter('filterBy-id', {
      id: parseInt(id, 10),
    });
    if (result.length) {
      const [row] = result;
      ctx.response.body = row;
    } else ctx.response.status = 404;
  } else {
    const { option } = ctx.request.query;
    if (option === '') {
      const { skip, take } = ctx.request.query;
      const result = await bulletinRepositoryFilter(option || '', {
        take: parseInt(take, 10) || 10,
        skip: parseInt(skip, 10) || 0,
      });
      ctx.response.body = result;
    }
    if (option === 'statsBy-today-total') {
      const { tag } = ctx.request.query;
      const result = await bulletinRepositoryFilter(option, {
        tag,
        date: dayjs().format('YYYY-MM-DD'),
      });
      const [row] = result;
      ctx.response.body = row;
    }
  }
};

export const bulletinEndpointPost = async (ctx) => {
  const flakeIdGen = new FlakeId({
    datacenter: DATACENTER_ID,
    worker: WORKER_ID,
    epoch: EPOCH,
  });
  const fid = flakeIdGen.next();
  const { title, expireAt, tag, detail } = ctx.request.body;
  const result = await saveBulletin({
    id: fid.readBigInt64BE(0),
    title,
    publishTime: new Date(),
    expireAt: new Date(expireAt),
    tag,
    detail,
  });
  if (result.affectedRows === 1) ctx.response.status = 201;
  else ctx.response.status = 400;
};

export const bulletinRepositoryFilter = async (option, data) => {
  const client = pool.promise();
  if (option === '') {
    const sql = `
    select * from bulletin order by id desc limit ${data.skip}, ${data.take}
    `;
    const [result] = await client.execute(sql, []);
    return result;
  }
  if (option === 'filterBy-id') {
    const sql = `
    select * from bulletin where id = ?
    `;
    const param = [data.id];
    const [result] = await client.execute(sql, param);
    return result;
  }
  if (option === 'statsBy-today-total') {
    const sql = `
		select (select count(*) from bulletin where json_contains(tag, ?) = true) total
        , (select count(*) from bulletin where position(? in publish_time) > 0 and json_contains(tag, ?) = true) today
    `;
    const param = [data.tag, data.date, data.tag];
    const [result] = await client.execute(sql, param);
    return result;
  }
  return [];
};

export const bulletinRepositorySave = async (data) => {
  const client = pool.promise();
  const sql = `
  insert into bulletin (id, title, publish_time, expire_at, tag, detail, misc)
      values (?, ?, ?, ?, ?, ?, ?)
  `;
  const param = [
    data.id,
    data.title,
    data.publishTime,
    data.expireAt,
    data.tag || '{}',
    data.detail || '{}',
    data.misc || '{}',
  ];
  const [result] = await client.execute(sql, param);
  return result;
};
