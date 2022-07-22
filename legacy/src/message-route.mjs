import Router from "@koa/router";
import { pool } from "./mysql.mjs";
import {
    filterByDetailRefIdRef1IdTimeRange,
    filterByDetailRef1IdTimeRangeGroupByRefId,
    filterByDetailRef1IdTimeRange,
} from "./message-repository.mjs";

export const get = async (ctx) => {
    const { option } = ctx.request.query;
    if (option === "filterBy-detail-ref1Id-timeRange") {
        const { ref1Id, detail, timeBegin, timeEnd } = ctx.request.query;
        const result = await filterByDetailRef1IdTimeRange(
            ref1Id,
            timeBegin,
            timeEnd,
            detail,
            false
        );
        ctx.response.body = result;
        return;
    }
    if (option === "filterBy-detail-ref1Id-timeRange-groupBy-refId") {
        const { ref1Id, detail, timeBegin, timeEnd } = ctx.request.query;
        const result = await filterByDetailRef1IdTimeRangeGroupByRefId(
            ref1Id,
            timeBegin,
            timeEnd,
            detail
        );
        ctx.response.body = result;
        return;
    }
    if (option === "filterBy-detail-refId-ref1Id-timeRange") {
        const { refId, ref1Id, detail, timeBegin, timeEnd } = ctx.request.query;
        const result = await filterByDetailRefIdRef1IdTimeRange(
            refId,
            ref1Id,
            timeBegin,
            timeEnd,
            detail,
            false
        );
        ctx.response.body = result;
        return;
    }
};

export const router = new Router({
    prefix: "/api/miscellaneous",
});

router.get("/message/statistic", async (ctx) => {
    const client = pool.promise();
    const option = ctx.request.query.option || "";
    if (option === "qty-by-ref_id2-category-tag-status") {
        const sql = `
        select count(*) qty
        from message
        where ref_id2 = ?
            and position(? in detail->>'$.category') > 0
            and position(? in detail->>'$.tag') > 0
            and position(? in detail->>'$.status') > 0
        `;
        const param = [
            parseInt(ctx.request.query.ref_id2, 10),
            ctx.request.query.category,
            ctx.request.query.tag,
            ctx.request.query.status,
        ];
        const [result] = await client.execute(sql, param);
        const [res] = result;
        ctx.response.body = res;
    }
});

router.get("/message/:id", async (ctx) => {
    const client = pool.promise();
    const option = ctx.request.query.option || "";
    if (option === "qty-by-ref_id2-status") {
        const sql = `
        select count(*) qty
        from message
        where ref_id2 = ?
            and detail->>'$.status' = ?
        `;
        const param = [parseInt(ctx.request.params.id, 10), ctx.request.query.status];
        const [result] = await client.execute(sql, param);
        ctx.response.body = result[0] || { qty: 0 };
    }
});

router.put("/message/:id", async (ctx) => {
    const client = pool.promise();
    const option = ctx.request.query.option || "";
    if (option === "status-by-ref_id2-and-tag") {
        const sql = `
        update message
        set detail = json_set(detail, '$.status', ?)
        where ref_id2 = ?
            and detail->>'$.tag' = ?
        `;
        const param = [
            ctx.request.body.status,
            parseInt(ctx.params.id || 0, 10),
            ctx.request.body.tag,
        ];
        const [result] = await client.execute(sql, param);
        ctx.response.body = result;
    } else if (option === "status-by-id_list") {
        const sql = `
        update message
        set detail = json_set(detail, '$.status', ?)
        where ref_id2 = ?
            and id in (${ctx.request.body.id_list || 0})
        `;
        const param = [ctx.request.body.status, parseInt(ctx.params.id, 10)];
        const [result] = await client.execute(sql, param);
        ctx.response.body = result;
    }
});

router.get("/message", async (ctx) => {
    const client = pool.promise();
    const option = ctx.request.query.option || "";
    if (option === "by-ref_id2-tag") {
        const sql = `
        select id
            , ref_id
            , ref_id2
            , dtime
            , detail->>'$.status' status
            , detail->>'$.category' category
            , detail->>'$.tag' tag
            , detail->>'$.title' title
            , detail->>'$.content' content
        from message
        where ref_id2 = ?
            and detail->>'$.tag' = ?
        order by id desc
        limit 100
        `;
        const param = [parseInt(ctx.request.query.ref_id2, 10), ctx.request.query.tag];
        const [result] = await client.execute(sql, param);
        ctx.response.body = result;
    } else if (option === "by-ref_id2-category-tag-status") {
        const sql = `
        select id
            , ref_id
            , ref_id2
            , dtime
            , detail->>'$.status' status
            , detail->>'$.category' category
            , detail->>'$.tag' tag
            , detail->>'$.title' title
            , detail->>'$.content' content
        from message
        where ref_id2 = ?
            and position(? in detail->>'$.category') > 0
            and position(? in detail->>'$.tag') > 0
            and position(? in detail->>'$.status') > 0
        limit 100
        `;
        const param = [
            parseInt(ctx.request.query.ref_id2, 10),
            ctx.request.query.category,
            ctx.request.query.tag,
            ctx.request.query.status,
        ];
        const [result] = await client.execute(sql, param);
        ctx.response.body = result;
    } else if (option === "by-ref_id-ref_id2-category") {
        const sql = `
        select id
            , ref_id
            , ref_id2
            , dtime
            , detail->>'$.status' status
            , detail->>'$.category' category
            , detail->>'$.tag' tag
            , detail->>'$.title' title
            , detail->>'$.content' content
        from message
        where (ref_id = ? and ref_id2 = ? and detail->'$.tag' = '企业用户' and detail->'$.category' = ?)
            or (ref_id = ? and ref_id2 = ? and detail->'$.tag' = '个人用户' and detail->'$.category' = ?)
        order by id
        limit 100
        `;
        const param = [
            parseInt(ctx.request.query.ref_id2, 10),
            parseInt(ctx.request.query.ref_id, 10),
            ctx.request.query.category,
            parseInt(ctx.request.query.ref_id, 10),
            parseInt(ctx.request.query.ref_id2, 10),
            ctx.request.query.category,
        ];
        const [result] = await client.execute(sql, param);
        ctx.response.body = result;
    } else if (option === "ref_id2-and-tag") {
        const sql = `
        select id
            , ref_id
            , ref_id2
            , dtime
            , detail->>'$.status' status
            , detail->>'$.category' category
            , detail->>'$.tag' tag
            , detail->>'$.title' title
            , detail->>'$.content' content
        from message
        where ref_id2 = ?
            and detail->>'$.tag' = ?
        order by id desc
        limit 100
        `;
        const param = [parseInt(ctx.request.query.ref_id2 || 0, 10), ctx.request.query.tag];
        const [result] = await client.execute(sql, param);
        ctx.response.body = result;
    } else if (option === "group-ref_id-by-ref_id2-tag-category-status") {
        // 指定接收方的已读/未读消息，按发送方分组，用于列表页
        const sql = `
        select ref_id, ref_id2, detail->>'$.tag' tag, detail->>'$.status' status, max(id) id
            , (select dtime from ovaphlow.message t2 where t2.id = max(t.id)) dtime
            , (select detail->>'$.content' from ovaphlow.message t2 where t2.id = max(t.id)) content
            , count(*) as qty
        from ovaphlow.message t
        where ref_id2 = ? and detail->>'$.tag' = ?
            and detail->>'$.category' = ?
            and detail->>'$.status' = ?
        group by ref_id
        `;
        const param = [
            parseInt(ctx.request.query.ref_id2 || 0, 10),
            ctx.request.query.tag,
            ctx.request.query.category,
            ctx.request.query.status,
        ];
        const [result] = await client.execute(sql, param);
        ctx.response.body = result;
    } else if (option === "group-ref_id-by-ref_id2-tag-category-exclude_list") {
        // 指定接收方的已读未回消息(排除指定接收方的未读消息的ref_id)，按发送方分组，用于列表页
        const sql = `
        select ref_id, ref_id2, detail->>'$.tag' tag, detail->>'$.status' status
            , max(id) id
            , (select dtime from ovaphlow.message t2 where t2.id = max(t.id)) dtime
        from ovaphlow.message t
        where ref_id2 = ? and detail->>'$.tag' = ?
            and detail->>'$.category' = ?
            and ref_id not in (${ctx.request.query.list || 0})
        group by ref_id
        order by dtime desc
        limit 100
        `;
        const param = [
            parseInt(ctx.request.query.ref_id2 || 0, 10),
            ctx.request.query.tag,
            ctx.request.query.category,
        ];
        const [result] = await client.execute(sql, param);
        ctx.response.body = result;
    } else if (option === "group-ref_id2-by-ref_id-tag-category-exclude_list") {
        // 指定发送方的消息（排除指定接收方的ref_id列表），按接收方分组，用于列表页
        const sql = `
        select ref_id, ref_id2, detail->>'$.tag' tag, detail->>'$.status' status
            , max(id) id
            , (select dtime from ovaphlow.message t2 where t2.id = max(t.id)) dtime
        from ovaphlow.message t
        where ref_id = ? and detail->>'$.tag' = ?
            and detail->>'$.category' = ?
            and ref_id2 not in (${ctx.request.query.list || 0})
        group by ref_id2
        order by dtime desc
        limit 100
        `;
        const param = [
            parseInt(ctx.request.query.ref_id || 0, 10),
            ctx.request.query.tag,
            ctx.request.query.category,
        ];
        const [result] = await client.execute(sql, param);
        ctx.response.body = result;
    }
});

router.post("/message", async (ctx) => {
    const client = pool.promise();
    const sql = `
    insert into
        message (ref_id, ref_id2, dtime, detail)
        values(?, ?, ?, json_object('status', '未读', 'category', ?, 'tag', ?, 'content', ?))
    `;
    const param = [
        ctx.request.body.ref_id,
        ctx.request.body.ref_id2,
        ctx.request.body.dtime,
        ctx.request.body.category,
        ctx.request.body.tag,
        ctx.request.body.content,
    ];
    const [result] = await client.execute(sql, param);
    ctx.response.body = result;
});
