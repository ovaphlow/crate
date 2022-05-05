import { pool } from "../utility/mysql";

export const filter = async (take: string, skip: string) => {
  const client = pool.promise();
  const sql = `
  select cast(id as char) id, title, publish_time, expire_at, tag, detail
  from bulletin
  order by publish_time desc, expire_at desc
  limit ${skip}, ${take}
  `;
  const [result] = await client.execute(sql, []);
  return result;
};
