import { pool } from "../utility/mysql";

export const repositoryFilterByCategoryRefId = async (category: string, refId: string) => {
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
