import nodemailer from "nodemailer";
import { filterByRefIdTag, save, update } from "../staging-repository.mjs";

export const sendMail2ResetPassword = async (ctx) => {
  const math = parseInt(
    Math.floor(Math.random() * (999999 - 100000 + 1) + 100000),
    10
  );
  const code = math.toString();

  const { refId } = ctx.request.body;
  const codes = await filterByRefIdTag({ refId, tag: JSON.stringify(["验证码"]) });
  if (codes.length > 0) {
    const [rowCode] = codes;
    const { affectedRows } = await update({
      refId,
      name: rowCode["name"],
      tag: JSON.stringify(rowCode["tag"]),
      detail: JSON.stringify({ code }),
      id: rowCode["id"]
    });
    if (affectedRows !== 1) {
      ctx.response.status = 500;
      return;
    }
  } else {
    const { affectedRows } = await save({
      refId,
      name: "",
      tag: JSON.stringify(["验证码"]),
      detail: JSON.stringify({ code }),
    });
    if (affectedRows !== 1) {
      ctx.response.status = 500;
      return;
    }
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_AUTH_USER,
      pass: process.env.EMAIL_AUTH_PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_AUTH_USER,
    to: ctx.request.body.email,
    subject: "学子就业网邮箱验证",
    html: `您的验证码是:<br/>
      <h1>${code}</h1>
    `,
  };
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error(error);
    } else {
      console.error(`发送邮件到${ctx.request.body.email}`);
    }
  });
  ctx.response.status = 200;
};
