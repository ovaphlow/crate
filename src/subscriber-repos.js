const { QueryTypes } = require('sequelize');

const sequelize = require('./sequelize');

module.exports = {
  get: async (option) => {
    if (option === '') {
      //
    } else if (option === 'for-auth') {
      const sql = `
      select id, username, detail->>'$.password' password, detail->>'$.salt' salt
      from subscriber
      where username = ?
      `;
      const result = await sequelize.query(sql, {
        replacements: [],
        type: QueryTypes.SELECT,
      });
      console.log(result);
      return result;
    }
    return { id: 0 };
  },
  signIn: async (data) => {
    console.log(data);
    const sql = `
    insert into
      subscriber (id, ref_id, ref_id2, username, detail)
      values (0, 0, 0, :username, json_build_object('password', :password, 'salt', :salt))
    `;
    const result = await sequelize.query(sql, {
      replacements: data,
      type: QueryTypes.INSERT,
    });
    return result;
  },
};
