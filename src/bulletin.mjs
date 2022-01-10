import { pool } from './mysql.mjs';

export const get = async (option, data) => {
  const client = pool.promise();
  if (option === '') {
    const sql = 'select * from bulletin order by id desc limit ?, ?';
    const [result] = await client.query(sql, [data.skip, data.take]);
    return result;
  }
  return [];
};

export const save = async (data) => {
  const client = pool.promise();
  const sql = `
  insert into bulletin (id, category, title, publish_time, expire_at, detail, misc)
      values (?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await client.query(sql, [
    data.id,
    data.category,
    data.title,
    data.publishTime,
    data.expireAt,
    data.detail || '{}',
    data.misc || '{}',
  ]);
  return result;
};
