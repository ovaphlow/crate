import { pool } from './mysql.mjs';

export const repository = {
  filter: async (option, data) => {
    const client = pool.promise();
    if (option === 'check-by-email-code') {
      const sql = `
      select id
      from captcha
      where email = ?
          and detail->>'$.code' = ?
      order by id desc
      limit 1
      `;
      const [result] = await client.query(sql, [data.email, data.code]);
      return result.length === 1 ? result[0].id : 0;
    }
    return { id: 0 };
  },

  save: async (data) => {
    const client = pool.promise();
    const sql = `
    insert into captcha (email, detail)
    values(?, json_object('tag', ?, 'code', ?, 'datime', ?))
    `;
    const [result] = await client.query(sql, [data.email, data.tag, data.code, data.datime]);
    return result;
  },
};
