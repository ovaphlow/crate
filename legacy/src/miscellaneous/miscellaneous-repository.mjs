import { pool } from "../mysql.mjs";

export const miscellaneousRepositoryFilter = async () => {
  const client = pool.promise();
  const sql = `
  select * from miscellaneous order by id desc limit 10
  `;
  const param = [];
  const [result] = await client.execute(sql, param);
  return result;
};

export const miscellaneousRepositoryFilterByIdRefIdRef1Id = async (data) => {
  const client = pool.promise();
  const sql = `
  select cast(id as char) id, cast(ref_id as char) ref_id, cast(ref1_id as char) ref1_id
      , publish_time, tag, detail
  from miscellaneous
  where id = ? and ref_id = ? and ref1_id = ?
  `;
  const param = [data.id, data.refId, data.ref1Id];
  const [result] = await client.execute(sql, param);
  return result;
};

export const miscellaneousRepositoryFilterByTag = async (data, take, skip) => {
  const client = pool.promise();
  const sql = `
  select cast(id as char) id, cast(ref_id as char) ref_id, cast(ref1_id as char) ref1_id
      , publish_time, tag, detail
  from miscellaneous
  where json_contains(tag, ?)
  order by id desc
  limit ${skip}, ${take}
  `;
  const param = [data.tag];
  const [result] = await client.execute(sql, param);
  return result;
};

export const miscellaneousRepositorySave = async (data) => {
  const client = pool.promise();
  const sql = `
  insert into miscellaneous (id, ref_id, ref1_id, publish_time, tag, detail)
      values (?, ?, ?, ?, ?, ?)
  `;
  const param = [
    data.id,
    data.refId,
    data.ref1Id,
    data.publishTime,
    data.tag,
    data.detail,
  ];
  const [result] = await client.execute(sql, param);
  return result;
};
