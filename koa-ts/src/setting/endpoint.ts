import { Context } from "koa";
import { repositoryFilterByCategoryRefId } from "./repository";

const getString = (v: string) => (v ? v : "");

export const endpointGet = async (ctx: Context) => {
  const { option } = ctx.request.query;
  if (getString(option?.toString()|| "") === "") {
    ctx.response.body = "[]";
  }
  if (option === "filterBy-category-refId") {
    const { category, refId } = ctx.request.query;
    const result = await repositoryFilterByCategoryRefId(category?.toString() || "", refId?.toString() || "");
    ctx.response.body = result;
  }
};
