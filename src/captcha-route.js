const Router = require('@koa/router');
const dayjs = require('dayjs');
const nodemailer = require('nodemailer');

const repos = require('./captcha-repository');
const CONFIGURATION = require('./configuration');
const logger = require('./winston');

const router = new Router({
  prefix: '/api/miscellaneous',
});

router.get('/captcha', async (ctx) => {
  const option = ctx.request.query.option || '';
  if (option === 'check-by-email-code') {
    const r = await repos.filter(option, ctx.request.query);
    if (r) ctx.response.status = 200;
    else ctx.response.status = 401;
  }
});

router.post('/captcha', async (ctx) => {
  const r = Math.floor(Math.random() * (999999 - 100000) + 100000);

  repos.save({
    email: ctx.request.body.email || '',
    tag: ctx.request.body.tag || '',
    code: r,
    datime: dayjs().format('YYYY-MM-DD HH:mm:ss.SSS'),
  });

  const transporter = nodemailer.createTransport({
    service: CONFIGURATION.EMAIL_SERVICE,
    auth: {
      user: CONFIGURATION.EMAIL_USERNAME,
      pass: CONFIGURATION.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: CONFIGURATION.EMAIL_USERNAME,
    to: ctx.request.body.email,
    subject: '学子就业网邮箱验证',
    html: `您的验证码是:<br/>
      <h1>${r}</h1>
    `,
  };
  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      logger.error(err);
    }
  });

  ctx.response.status = 200;
});

module.exports = router;
