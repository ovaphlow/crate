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
};
