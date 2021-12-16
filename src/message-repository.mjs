// const pool = require('./mysql');
import pool from './mysql.mjs';

// module.exports = {
export const repository = {
  save: async (option, data) => {
    const client = pool.promise();
    if (option === 'reply') {
      const sql = `
          insert into message (ref_id
                               , ref_id2
                               , dtime
                               , detail)
          values(0, ?, ?, ?)
          `;
      const [result] = await client.query(sql, [parseInt(data.id, 10), data.dtime, data.detail]);
      return result.affectedRows;
    }
    return 0;
  },
};

export default repository;
