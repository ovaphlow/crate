import { pool } from '../mysql.mjs';

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

/*
-- 线上招聘会 fair
insert into ovaphlow.bulletin (id, title, publish_time, expire_at, tag, detail)
select id, title, datime, datime
    , json_array("线上招聘会")
    , json_object("status", status, "content", content)
from billboard.job_fair;
*/

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
    select cast(id as char) id, title, publish_time, expire_at, tag, detail
    from bulletin where id = ?
    `;
    const param = [data.id];
    const [result] = await client.execute(sql, param);
    return result;
  }
  if (option === 'filterBy-tag') {
    const sql = `
    select cast(id as char) id, title, publish_time, expire_at, tag, detail
    from bulletin where json_contains(tag, ?)
    order by publish_time desc
    limit ${data.skip}, ${data.take}
    `;
    const param = [data.tag];
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
  insert into bulletin (id, title, publish_time, expire_at, tag, detail)
      values (?, ?, ?, ?, ?, ?)
  `;
  const param = [
    data.id,
    data.title,
    data.publishTime,
    data.expireAt,
    data.tag || '{}', // json格式不允许有默认值，所以在没传数据的情况下要赋一个默认值'{}'
    data.detail || '{}',
  ];
  const [result] = await client.execute(sql, param);
  return result;
};
