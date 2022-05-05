// import dayjs from "dayjs";
// import FlakeId from "flake-idgen";
import { Context } from "koa";
import { filter } from "./repository";

export const get = async (ctx: Context) => {
  const { option } = ctx.request.query;
  if (option?.toString() || "" === "") {
    const { take, skip } = ctx.request.query;
    const result = await filter(take?.toString() || "10", skip?.toString() || "0");
    ctx.response.body = result;
  }
};
