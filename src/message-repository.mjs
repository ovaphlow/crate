import { pool } from './mysql.mjs';

export const repository = {
  save: async (option, data) => {
    const client = pool.promise();
    if (option === 'reply') {
      const [result] = await client.execute(`
      insert into message (ref_id, ref_id2, dtime, detail)
      values(0, ?, ?, ?)
      `, [parseInt(data.id, 10), data.dtime, data.detail]);
      return result.affectedRows;
    }
    return 0;
  },
};
