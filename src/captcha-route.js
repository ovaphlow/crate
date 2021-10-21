const Router = require('@koa/router');
const dayjs = require('dayjs');
const nodemailer = require('nodemailer');

const repos = require('./captcha-repos');

const router = new Router({
  prefix: '/api/miscellaneous',
});

router.get('/captcha', async (ctx) => {
  let r = Math.floor(Math.random() * (999999 - 100000) + 100000);
  // send a captcha mail
  repos.save({
    email: ctx.request.query.email || '',
    tag: ctx.request.query.tag || '',
    code: r,
    datime: dayjs().format('YYYY-MM-DD HH:mm:ss.SSS'),
  });
  ctx.response.body = r;
});

module.exports = router;
