import { pool } from './mysql.mjs';

export const repository = {
  get: async (option, data) => {
    const client = pool.promise();
    if (option === '') {
      //
    } else if (option === 'for-auth') {
      const [result] = await client.execute(`
      select id, username, detail->>'$.password' password, detail->>'$.salt' salt
      from subscriber
      where username = ?
      `, [data.username]);
      const [row] = result;
      return row;
    }
    return { id: 0 };
  },

  filter: async (option, data) => {
    const client = pool.promise();
    if (option === '') {
      //
    } else if (option === 'by-username') {
      const [result] = await client.execute(`
      select id, username, detail->>'$.password' password, detail->>'$.salt' salt
      from subscriber
      where username = ?
      `, [data.username]);
      return result;
    }
    return [];
  },

  signUp: async (data) => {
    const client = pool.promise();
    const [result] = await client.execute(`
    insert into subscriber (id, username, detail)
        values (?, ?, json_object('password', ?, 'salt', ?))
    `, [data.id, data.username, data.password, data.salt]);
    return result;
  },
};

export const signUp = async (data) => {
  const client = pool.promise();
  const [result] = await client.execute(`
  insert into subscriber (id, username, detail)
      values (?, ?, json_object('password', ?, 'salt', ?))
  `, [data.id, data.username, data.password, data.salt]);
  return result;
};
