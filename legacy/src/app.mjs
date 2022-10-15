import Koa from "koa";
import bodyParser from "koa-bodyparser";
import helmet from "koa-helmet";
import koaLogger from "koa-logger";
import rewrite from "koa-rewrite";
import Router from "@koa/router";
import { logger } from "./logger-pino.mjs";
import {
  bulletinEndpointGet,
  bulletinEndpointPost,
  bulletinEndpointPut,
  bulletinEndpointDelete,
} from "./bulletin/bulletin-endpoint.mjs";
import {
  miscellaneousEndpointGet,
  miscellaneousEndpointPost,
} from "./miscellaneous/miscellaneous-endpoint.mjs";
import { stagingEndpointGet } from "./staging.mjs";
import { complexEndpointBulletinJournal } from "./complex/complex-endpoint.mjs";

export const app = new Koa();

app.use(helmet());

app.use(bodyParser({ jsonLimit: "16mb" }));

app.use(
  rewrite(/^\/api\/miscellaneous\/setting(.*)/, "/api/crate/single/setting$1")
);

app.use(
  koaLogger((str, args) => {
    logger.debug(str, args);
  })
);

app.on("error", (err, ctx) => {
  logger.error(`${ctx.req.method} ${ctx.req.url}`);
  logger.error(err.stack);
});

(() => {
  import("./captcha-route.mjs").then(({ router }) => {
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

(() => {
  import("./favorite-route.mjs").then(({ router }) => {
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

(() => {
  import("./feedback-route.mjs").then(({ router }) => {
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

(() => {
  import("./file.mjs").then(({ router }) => {
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

(() => {
  import("./journal/journal-endpoint.mjs").then(({ router }) => {
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

(() => {
  import("./message-route.mjs").then(({ router }) => {
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

(() => {
  import("./setting-route.mjs").then(({ router }) => {
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

(() => {
  import("./subscriber-route.mjs").then(({ router }) => {
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
})();

const router = new Router();

(() => {
  router.get("/api/complex/bulletin-journal", complexEndpointBulletinJournal);
})();

(() => {
  // bulletin
  router.get("/api/simple/bulletin/:id", bulletinEndpointGet);
  router.put("/api/simple/bulletin/:id", bulletinEndpointPut);
  router.delete("/api/simple/bulletin/:id", bulletinEndpointDelete);
  router.get("/api/simple/bulletin", bulletinEndpointGet);
  router.post("/api/simple/bulletin", bulletinEndpointPost);
  import("./bulletin/endpoint.mjs").then(({ endpointGet }) => {
    router.get("/crate-api/bulletin", endpointGet);
    logger.info(
      `挂载 GET /crate-api/bulletin 至 bulletin/endpoint.mjs->endpointGet`
    );
    router.get("/crate-api/bulletin/:uuid/:id", endpointGet);
    logger.info(
      `挂载 GET /crate-api/bulletin/:uuid/:id 至 bulletin/endpoint.mjs->endpointGet`
    );
  });
  import("./bulletin/endpoint.mjs").then(({ endpointPost }) => {
    router.post("/crate-api/bulletin", endpointPost);
    logger.info(
      `挂载 POST /crate-api/bulletin 至 bulletin/endpoint.mjs->endpointPost`
    );
  });
})();

(() => {
  import("./email/email-endpoint.mjs").then(({ sendMail2ResetPassword }) => {
    router.post(
      "/crate-api/email/actions/send-mail-2-reset-password",
      sendMail2ResetPassword
    );
    logger.info(
      `挂载 GET /crate-api/email/actions/send-mail-2-reset-password 至 email/email-endpoint.mjs->sendMail2ResetPassword`
    );
  });
})();

(() => {
  import("./message-route.mjs").then(({ get }) => {
    router.get("/crate-api/message", get);
  });
})();

(() => {
  // miscellaneous
  // favorite, feedback, file, journal, message, setting
  router.get(
    "/api/simple/miscellaneous/:id/:refId/:ref1Id",
    miscellaneousEndpointGet
  );
  router.get("/api/simple/miscellaneous", miscellaneousEndpointGet);
  router.post("/api/simple/miscellaneous", miscellaneousEndpointPost);
})();

(() => {
  import("./staging.mjs").then(({ stagingEndpointGet }) => {
    router.get("/crate-api/staging", stagingEndpointGet);
  })
})();

(() => {
  import("./setting-route.mjs").then(({ endpointGet }) => {
    router.get("/crate-api/setting", endpointGet);
  });
})();

(() => {
  // staging
  // captcha
  router.get("/api/simple/staging/:id", stagingEndpointGet);
  router.get("/api/simple/staging", stagingEndpointGet);
})();

app.use(router.routes());
app.use(router.allowedMethods());
