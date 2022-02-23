import { pool } from './mysql.mjs';

export const saveMessage = async (option, data) => {
  const client = pool.promise();
  if (option === 'reply') {
    const sql = `
    insert into message (ref_id, ref_id2, dtime, detail)
    values(0, ?, ?, ?)
    `;
    const param = [parseInt(data.id, 10), data.dtime, data.detail];
    const [result] = await client.execute(sql, param);
    return result.affectedRows;
  }
  return 0;
};
