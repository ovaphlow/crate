import Koa, { Context } from "koa";
import bodyParser from "koa-bodyparser";
import helmet from "koa-helmet";
import Router from "@koa/router";
import pino from "koa-pino-logger";

export const app = new Koa();

app.use(helmet());

app.use(pino());

app.use(bodyParser({ jsonLimit: "16mb" }));

app.on("error", (err: Error, ctx: Context) => {
  ctx.log.error(`${ctx.req.method} ${ctx.req.url}`);
  ctx.log.error(err.stack);
});

const router = new Router();

(() => {
  import("./bulletin/endpoint").then(({ get }) => {
    router.get("/crate-api/bulletin", get);
  });
})();

(() => {
  import("./setting/endpoint").then(({ endpointGet }) => {
    router.get("/crate-api/setting", endpointGet);
  });
})();

app.use(router.routes());
app.use(router.allowedMethods());
