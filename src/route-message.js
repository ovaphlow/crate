const Router = require('@koa/router');

const pool = require('./mysql');

const router = new Router({
  prefix: '/api/miscellaneous',
});

module.exports = router;
