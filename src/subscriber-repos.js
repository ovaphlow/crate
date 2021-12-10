const pool = require('./mysql');

module.exports = {
  get: async (option, data) => {
    const client = pool.promise();
    if (option === '') {
      //
    } else if (option === 'auth') {
      const sql = `
      select id, username, detail->>'$.password' password, detail->>'$.salt' salt
      from subscriber
      where username = ?
      `;
      const [result] = await client.query(sql, [data.username]);
      const [row] = result;
      return row;
    }
    return { id: 0 };
  },
};
