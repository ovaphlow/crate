const pool = require('./mysql');

module.exports = {
  save: async (option, data) => {
    let client = pool.promise();
    if ('reply' === option) {
      let sql = `
          insert into message (ref_id
                               , ref_id2
                               , dtime
                               , detail)
          values(0, ?, ?, ?)
          `;
      let [result] = await client.query(sql, [parseInt(data.id, 10), data.dtime, data.detail]);
      return result.affectedRows;
    }
  },
};
