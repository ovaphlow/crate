const pool = require('./mysql');

module.exports = {
  filter: async (option, data) => {
    let client = pool.promise();
    if ('check-by-email-code' === option) {
      let sql = `
          select id
          from captcha
          where email = ?
            and detail->>'$.code' = ?
          order by id desc
          limit 1
          `;
      let [result] = await client.query(sql, [data.email, data.code]);
      return result.length === 1 ? result[0].id : 0;
    }
  },

  save: async (data) => {
    let client = pool.promise();
    let sql = `
        insert into captcha (email
                             , detail)
        values(?
               , json_object('tag', ?
                             , 'code', ?
                             , 'datime', ?))
        `;
    let [result] = await client.query(sql, [
      data.email,
      data.tag,
      data.code,
      data.datime,
    ]);
    return result;
  },
};
