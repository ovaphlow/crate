import crypto from "crypto";

import Router from "@koa/router";
import { v5 as uuidv5 } from "uuid";
import * as jose from "jose";
import FlakeId from "flake-idgen";

import {
  PRIVATE_KEY,
  PUBLIC_KEY,
  DATACENTER_ID,
  WORKER_ID,
  EPOCH,
  SECRET,
} from "./configuration.mjs";
import { pool } from "./mysql.mjs";
import { repository, signUp } from "./subscriber-repository.mjs";

export const router = new Router({
  prefix: "/api/miscellaneous",
});

async function signJWT(data) {
  const privateKey = await jose.importPKCS8(PRIVATE_KEY);
  const jwt = await new jose.SignJWT(data)
    .setProtectedHeader({ alg: "ES256" })
    .setIssuedAt()
    .setIssuer("https://ovaphlow.io")
    .setAudience("ovaphlow:crate")
    .setExpirationTime("168h")
    .sign(privateKey);
  return jwt;
}

router.post("/subscriber/sign-in", async (ctx) => {
  const { username } = ctx.request.body;
  const user = await repository.get("for-auth", { username });
  const { id } = user ?? { id: 0 };
  if (id > 0) {
    const hmac = crypto.createHmac("sha256", user.salt);
    const { password } = ctx.request.body;
    hmac.update(password);
    const passwordSalted = hmac.digest("hex");
    if (passwordSalted === user.password) {
      const jwt = await signJWT({ id, username });
      ctx.response.body = jwt;
    } else {
      ctx.response.status = 401;
    }
  } else {
    ctx.response.status = 401;
  }
});

router.post("/subscriber/sign-up", async (ctx) => {
  const { username } = ctx.request.body;
  const result = await repository.filter("by-username", { username });
  if (result.length > 0) {
    ctx.response.status = 401;
    return;
  }
  const salt = crypto.randomBytes(8).toString("hex");
  const hmac = crypto.createHmac("sha256", salt);
  const { password } = ctx.request.body;
  hmac.update(password);
  const passwordSalted = hmac.digest("hex");
  const flakeIdGen = new FlakeId({
    datacenter: DATACENTER_ID,
    worker: WORKER_ID,
    epoch: EPOCH,
  });
  const fid = flakeIdGen.next();
  const r = await signUp({
    id: fid.readBigInt64BE(0).toString(),
    username,
    password: passwordSalted,
    salt,
  });
  const [id] = r;
  const jwt = await signJWT({ id, username });
  ctx.response.body = jwt;
});

router.post("/subscriber/refresh-token", async (ctx) => {
  const jwt = ctx.request.header.authorization.replace("Bearer ", "");
  const publicKey = await jose.importSPKI(PUBLIC_KEY);
  const result = await jose.jwtVerify(jwt, publicKey, {
    issuer: "https://ovaphlow.io",
    audience: "ovaphlow:crate",
  });
  const { id, username } = result.payload;
  const freshJWT = await signJWT({ id, username });
  ctx.response.body = freshJWT;
});

router.get("/subscriber/:id", async (ctx) => {
  const client = pool.promise();
  const sql = `
  select id
      , username
      , detail->>'$.name' name
      , detail->>'$.uuid' uuid
  from subscriber
  where id = ?
      and detail->>'$.uuid' = ?
  `;
  const param = [parseInt(ctx.params.id, 10), ctx.request.query.uuid];
  const [result] = await client.execute(sql, param);
  ctx.response.body = result.length === 1 ? result[0] : {};
});

router.put("/subscriber/:id", async (ctx) => {
  const client = pool.promise();
  const sql = `
  update subscriber
  set username = ?
      , detail = json_set(detail, '$.name', ?)
  where id = ?
      and detail->>'$.uuid' = ?
  `;
  const param = [
    ctx.request.body.username,
    ctx.request.body.name,
    parseInt(ctx.params.id, 10),
    ctx.request.query.uuid,
  ];
  const [result] = await client.execute(sql, param);
  ctx.response.body = result;
});

router.delete("/subscriber/:id", async (ctx) => {
  const client = pool.promise();
  const sql = `
  delete from subscriber
  where id = ?  and detail->>'$.uuid' = ?
  `;
  const param = [parseInt(ctx.params.id, 10), ctx.request.query.uuid || ""];
  const [result] = await client.execute(sql, param);
  ctx.response.body = result;
});

router.get("/subscriber", async (ctx) => {
  const client = pool.promise();
  const option = ctx.request.query.option || "";
  if (option === "tag") {
    const sql = `
    select id
        , username
        , detail->>'$.name' name
        , detail->>'$.uuid' uuid
    from subscriber
    where detail->>'$.tag' = ?
    order by id desc
    limit 20
    `;
    const param = [ctx.request.query.tag];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result;
  } else ctx.response.body = [];
});

router.post("/subscriber", async (ctx) => {
  const client = pool.promise();
  let sql = `
  select count(*) qty from subscriber where username = ?
  `;
  let param = [ctx.request.body.username];
  let [result] = await client.execute(sql, param);
  if (result[0].qty !== 0) {
    ctx.response.status = 401;
    return;
  }
  sql = `
  insert into subscriber (username, detail) values(?, ?)
  `;
  param = [
    ctx.request.body.username,
    JSON.stringify({
      uuid: uuidv5(ctx.request.body.username, Buffer.from(SECRET)),
      name: ctx.request.body.name,
      password: ctx.request.body.password,
      tag: ctx.request.body.tag,
    }),
  ];
  [result] = await client.execute(sql, param);
  ctx.response.body = result;
});
