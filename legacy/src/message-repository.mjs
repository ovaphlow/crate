import { pool } from "./mysql.mjs";

/*
CREATE TABLE `message` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `ref_id` int unsigned NOT NULL DEFAULT '0',
  `ref_id2` int unsigned NOT NULL DEFAULT '0',
  `dtime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `detail` json NOT NULL,
  PRIMARY KEY (`id`),
  KEY `message_ref_id_IDX` (`ref_id`) USING BTREE,
  KEY `message_ref_id2_IDX` (`ref_id2`) USING BTREE,
  KEY `message_dtime_idx` (`dtime`)
) ENGINE=InnoDB AUTO_INCREMENT=12749 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='消息';
*/

const column = ["cast(id as char) id", "ref_id", "ref_id2", "dtime", "detail"];

export const filterByDetailRef1IdTimeRange = async (
  ref1Id,
  timeBegin,
  timeEnd,
  detail,
  counter
) => {
  const client = pool.promise();
  const sql = `
    select ${counter ? "count(*) qty" : column.join(", ")}
    from message
    where ref_id2 = ?
        and dtime between ? and ?
        and json_contains(detail, ?)
    order by id desc
    `;
  const param = [ref1Id, timeBegin, timeEnd, detail];
  const [result] = await client.execute(sql, param);
  return result;
};

export const filterByDetailRef1IdTimeRangeGroupByRefId = async (
  ref1Id,
  timeBegin,
  timeEnd,
  detail
) => {
  const client = pool.promise();
  const sql = `
    select ${column.join(", ")}, count(*) qty
    from (
        select *
        from message
        where ref_id2 = ?
        order by dtime desc
        limit 256
    ) msg
    where dtime between ? and ?
        and json_contains(detail, ?)
    group by ref_id
    `;
  const param = [ref1Id, timeBegin, timeEnd, detail];
  const [result] = await client.execute(sql, param);
  return result;
};

export const filterByDetailRefIdRef1IdTimeRange = async (
  refId,
  ref1Id,
  timeBegin,
  timeEnd,
  detail,
  counter
) => {
  const client = pool.promise();
  const sql = `
    select ${counter ? "count(*) qty" : column.join(", ")}
    from message
    where ref_id = ?
        and ref_id2 = ?
        and dtime between ? and ?
        and json_contains(detail, ?)
    order by id desc
    `;
  const param = [refId, ref1Id, timeBegin, timeEnd, detail];
  const [result] = await client.execute(sql, param);
  return result;
};

export const saveMessage = async (option, data) => {
  const client = pool.promise();
  if (option === "reply") {
    const sql = `
        insert into message (ref_id, ref_id2, dtime, detail)
        values(0, ?, ?, ?)
        `;
    const param = [parseInt(data.id, 10), data.dtime, data.detail];
    const [result] = await client.execute(sql, param);
    return result.affectedRows;
  }
  return 0;
};
