import { pool } from "./mysql.mjs";

export const repository = {
  get: async (option, data) => {
    const client = pool.promise();
    if (option === "") {
      //
    } else if (option === "for-auth") {
      const sql = `
            select id, username, detail->>'$.password' password, detail->>'$.salt' salt
            from subscriber
            where username = ?
            `;
      const param = [data.username];
      const [result] = await client.execute(sql, param);
      const [row] = result;
      return row;
    }
    return { id: 0 };
  },

  filter: async (option, data) => {
    const client = pool.promise();
    if (option === "") {
      //
    } else if (option === "by-username") {
      const sql = `
            select id, username, detail->>'$.password' password, detail->>'$.salt' salt
            from subscriber
            where username = ?
            `;
      const param = [data.username];
      const [result] = await client.execute(sql, param);
      return result;
    }
    return [];
  },

  signUp: async (data) => {
    const client = pool.promise();
    const sql = `
        insert into
            subscriber (id, username, detail)
            values (?, ?, json_object('password', ?, 'salt', ?))
        `;
    const param = [data.id, data.username, data.password, data.salt];
    const [result] = await client.execute(sql, param);
    return result;
  },
};

export const signUp = async (data) => {
  const client = pool.promise();
  const sql = `
    insert into
        subscriber (id, username, detail)
        values (?, ?, json_object('password', ?, 'salt', ?))
    `;
  const param = [data.id, data.username, data.password, data.salt];
  const [result] = await client.execute(sql, param);
  return result;
};
