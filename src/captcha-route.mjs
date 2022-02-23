import Router from '@koa/router';
import dayjs from 'dayjs';
import nodemailer from 'nodemailer';

import { repository } from './captcha-repository.mjs';
import {
  EMAIL_SERVICE,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
} from './configuration.mjs';
import { logger } from './winston.mjs';

export const router = new Router({
  prefix: '/api/miscellaneous',
});

router.get('/captcha', async (ctx) => {
  const option = ctx.request.query.option || '';
  if (option === 'check-by-email-code') {
    const r = await repository.filter(option, ctx.request.query);
    if (r) ctx.response.status = 200;
    else ctx.response.status = 401;
  }
});

router.post('/captcha', async (ctx) => {
  const r = Math.floor(Math.random() * (999999 - 100000) + 100000);
  repository.save({
    email: ctx.request.body.email || '',
    tag: ctx.request.body.tag || '',
    code: r,
    datime: dayjs().format('YYYY-MM-DD HH:mm:ss.SSS'),
  });
  const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: EMAIL_USERNAME,
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
