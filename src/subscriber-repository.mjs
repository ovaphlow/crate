import Sequelize from 'sequelize';

import { sequelize } from './sequelize.mjs';

const { QueryTypes } = Sequelize;

export const repository = {
  get: async (option, data) => {
    if (option === '') {
      //
    } else if (option === 'for-auth') {
      const sql = `
      select id, username, detail->>'$.password' password, detail->>'$.salt' salt
      from subscriber
      where username = :username
      `;
      const result = await sequelize.query(sql, {
        replacements: data,
        type: QueryTypes.SELECT,
      });
      const [row] = result;
      return row;
    }
    return { id: 0 };
  },

  filter: async (option, data) => {
    if (option === '') {
      //
    } else if (option === 'by-username') {
      const sql = `
      select id, username, detail->>'$.password' password, detail->>'$.salt' salt
      from subscriber
      where username = :username
      `;
      const result = await sequelize.query(sql, {
        replacements: data,
        type: QueryTypes.SELECT,
      });
      return result;
    }
    return [];
  },

  signUp: async (data) => {
    const sql = `
    insert into subscriber (id, username, detail)
        values (:id, :username, json_object('password', :password, 'salt', :salt))
    `;
    const result = await sequelize.query(sql, {
      replacements: data,
      type: QueryTypes.INSERT,
    });
    return result;
  },
};

export const signUp = async (data) => {
  const sql = `
  insert into subscriber (id, username, detail)
      values (:id, :username, json_object('password', :password, 'salt', :salt))
  `;
  const result = await sequelize.query(sql, {
    replacements: data,
    type: QueryTypes.INSERT,
  });
  return result;
};
