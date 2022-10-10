import Router from "@koa/router";
import { pool } from "./mysql.mjs";

const getString = (v) => (v ? v : "");

export const endpointGet = async (ctx) => {
  const { option } = ctx.request.query;
  if (getString(option) === "filterBy-category") {
    const repositoryFilterByCategory = async (category) => {
      const client = pool.promise();
      const sql = `
            select cast(id as char) id, category, ref_id, ref1_id, detail
            from setting
            where category = ?
            `;
      const param = [category];
      const [result] = await client.execute(sql, param);
      return result;
    };
    const { category } = ctx.request.query;
    const result = await repositoryFilterByCategory(category);
    ctx.response.body = result;
  }
  if (getString(option) === "filterBy-category-refId") {
    const repositoryFilterByCategoryRefId = async (category, refId) => {
      const client = pool.promise();
      const sql = `
            select cast(id as char) id, category, ref_id, ref1_id, detail
            from setting
            where ref_id = ?
                and category = ?
            `;
      const param = [refId, category];
      const [result] = await client.execute(sql, param);
      return result;
    };
    const { category, refId } = ctx.request.query;
    const result = await repositoryFilterByCategoryRefId(category, refId);
    ctx.response.body = result;
  }
};

export const router = new Router({
  prefix: "/api/crate/single",
});

router.get("/setting", async (ctx) => {
  const client = pool.promise();
  const option = ctx.request.query.option || "";
  if (option === "by-category") {
    const sql = `
        select id
            , category
            , ref_id
            , ref1_id
            , detail->>'$.uuid' uuid
            , detail->>'$.name' name
        from setting
        where category = ?
        `;
    const param = [ctx.request.query.category];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result;
  } else if (option === "category") {
    const sql = `
        select id
            , category
            , ref_id
            , ref1_id
            , detail->>'$.uuid' uuid
            , detail->>'$.name' name
        from setting
        where category = ?
            and ref_id = 0
        `;
    const param = [ctx.request.query.category];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result;
  }
});
