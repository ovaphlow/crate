import { pool } from "../mysql.mjs";

export const filterByDetailRefId2DtimeRange = async (data) => {
    const client = pool.promise();
    const sql = `
    select *
    from ovaphlow.logbook
    where ref_id2 = ?
        and json_contains(detail, ?)
        and dtime between ? and ?
    `;
    const param = [data.refId2, data.detail, data.dtimeBegin, data.dtimeEnd];
    const [result] = await client.execute(sql, param);
    return result;
};

export const journalRepositoryFilterByDetailDtimeRangeRefId2s = async (data) => {
    const client = pool.promise();
    const sql = `
    select *
    from ovaphlow.logbook
    where ref_id2 in (${data.refId2s})
        and json_contains(detail, ?)
        and dtime between ? and ?
    `;
    const param = [data.detail, data.dtimeBegin, data.dtimeEnd];
    const [result] = await client.execute(sql, param);
    return result;
};
