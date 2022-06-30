import Koa, { Context } from "koa";
import bodyParser from "koa-bodyparser";
import helmet from "koa-helmet";
import Router from "@koa/router";
import pino from "koa-pino-logger";
import path from "path";

export const app = new Koa();

app.use(helmet());

app.use(pino());

app.use(bodyParser({ jsonLimit: "16mb" }));

app.on("error", (err: Error, ctx: Context) => {
    ctx.log.error(`${ctx.req.method} ${ctx.req.url}`);
    ctx.log.error(err);
});

const router = new Router();

(() => {
    import("./utility/jose").then(({ signJwt, decodeJwt }) => {
        router.get("/crate-api/jose", async (ctx: Context) => {
            const jwt = signJwt("0","name","email","phone");
            ctx.response.body = { jwt };
        });
        router.get("/crate-api/jose/decode", async (ctx: Context) => {
            const { jwt } = ctx.request.query;
            const payload = decodeJwt(jwt?.toString() || "");
            ctx.response.body = payload;
        });
    });
})();

(() => {
    import("./bulletin/endpoint").then(({ endpointDelete, get, getWithResourceId, put, post }) => {
        router.get("/crate-api/bulletin/:uuid/:id", getWithResourceId);
        router.put("/crate-api/bulletin/:uuid/:id", put);
        router.delete("/crate-api/bulletin/:id", endpointDelete);
        router.get("/crate-api/bulletin", get);
        router.post("/crate-api/bulletin", post);
    });
})();

(() => {
    import("./setting/endpoint").then(({ get }) => {
        router.get("/crate-api/setting", get);
    });
})();

app.use(router.routes());
app.use(router.allowedMethods());
