const pool = require('./mysql');

module.exports = {
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
    let [result] = await client.query(sql, [data.email, data.tag, data.code, data.datime]);
    return result;
  },
};
