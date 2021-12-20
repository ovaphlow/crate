import { QueryTypes } from 'sequelize';

import { sequelize } from './sequelize.mjs';

export const remove = async (data) => {
  const sql = 'delete from favorite where id = :id';
  const result = await sequelize.query(sql, {
    replacements: data,
    type: QueryTypes.DELETE,
  });
  return result;
};

export const filter = async (option, data) => {
  if (option === 'ref_id-and-tag') {
    const sql = `
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
    `;
    const result = await sequelize.query(sql, {
      replacements: data,
      type: QueryTypes.SELECT,
    });
    return result;
  }
};
