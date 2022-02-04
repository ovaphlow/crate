import { pool } from './mysql.mjs';

export const remove = async (data) => {
  const client = pool.promise();
  const [result] = await client.execute(`
  delete from favorite where id = ?
  `, [data.id]);
  return result;
};

export const filter = async (option, data) => {
  const client = pool.promise();
  if (option === 'ref_id-and-tag') {
    const [result] = await client.execute(`
    select id
        , ref_id
        , ref_id2
        , dtime
        , detail->>'$.category' category
        , detail->>'$.tag' tag
        , detail->>'$.ref_uuid' ref_uuid
        , detail->>'$.ref_uuid2' ref_uuid2
    from favorite
    where ref_id = :ref_id
        and detail->>'$.tag' = :tag
    order by id desc
    limit 100
    `, [data.ref_id, data.tag]);
    return result;
  }
  return [];
};
